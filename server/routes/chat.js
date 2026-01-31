import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";
import TurndownService from "turndown";
import { Impit } from "impit";
// import fs from "fs";
import * as cheerio from "cheerio";
import { generateResponse, validateAiResponse, createPrompt } from "./ai.js";
class AiValidationError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "AiValidationError";
    this.meta = meta;
  }
}
const router = express.Router();
router.post("/create", authMiddleware, async (req, res) => {
  const { message, recipeId, recipeVersion } = req.body;
  if (!message?.trim())
    return res.status(400).json({ error: "Message is required" });
  try {
    db.prepare(
      ` INSERT INTO messages (user_id, recipe_id, role, content,status)
        VALUES (?, ?, 'user', ?,'create')`,
    ).run(req.user.id, recipeId ?? null, message);

    const URL_REGEX = /(https?:\/\/[^\s]+)/i;
    const containsUrl = message.match(URL_REGEX);
    const url = containsUrl ? containsUrl[1] : null;

    // if (url) {
    //   //#1 check db if source url of recipe already exist
    //   const sourceExists = db
    //     .prepare(
    //       `
    //         SELECT source_url
    //         FROM recipes
    //         WHERE source_url = ?
    //       `,
    //     )
    //     .get(source_url);

    //   //existing recipe from url and message has no modifications
    //   if (sourceExists && message === url) {
    //     return;
    //   }
    // }
    let urlContent = await checkMessageURL(url);
    const contextData =
      typeof urlContent === "object"
        ? JSON.stringify(urlContent, null, 2)
        : urlContent;
    const prompt = createPrompt(message, recipeVersion || null, contextData);

    const aiResponse = await generateResponse(prompt);

    const reply = validateAiResponse({
      response: aiResponse,
      recipeId: recipeId ?? null,
      userId: req.user.id,
      message,
      url,
    });

    return res.json({ reply });
  } catch (err) {
    const now = new Date();
    if (err instanceof AiValidationError) {
      console.error(`[${now.toISOString()}] AI validation failed`, err.meta);
      return res.status(400).json({ error: err.message });
    }

    console.error(`[${now.toISOString()}] Create recipe failed`, err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

async function checkMessageURL(url) {
  const impit = new Impit({
    browser: "chrome",
    ignoreTlsErrors: true,
  });

  const response = await impit.fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  //#1: get information from application/db
  const jsonLd = checkJsonLd($);
  if (jsonLd) {
    return jsonLd;
  }

  //#2: if jsonLd does not exist get information from html
  const bodyContent = checkHtml($);
  return bodyContent;
  // fs.writeFileSync("output.md", bodyContent, "utf8");
}

function checkJsonLd($) {
  const scripts = $('script[type="application/ld+json"]');
  let result = null;
  scripts.each((i, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      const items = Array.isArray(parsed) ? parsed : [parsed];

      for (const item of items) {
        const graph = item["@graph"] || [item];
        const recipe = graph.find((obj) => obj["@type"] === "Recipe");
        if (recipe) {
          result = recipe;
          return false;
        }
      }
    } catch (e) {}
  });
  return result;
}

function checkHtml($) {
  $(REMOVE_SELECTORS).remove();
  const bodyInnerHtml = $("body").html();
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  const markdown = turndownService.turndown(bodyInnerHtml);
  // fs.writeFileSync("output.html", bodyInnerHtml, "utf8");
  return markdown.replace(/\n\s*\n\s*\n/g, "\n\n");
}
const REMOVE_SELECTORS = `
  style, script, nav, footer, header, .drawer-nav, .site-header,
  .social-menu, .jump-button-group, .post-disclosure, .skip-link,
  .screen-reader-text, .faq-section, .savetherecipe,
  iframe, img, svg, picture, video, noscript, button, form, 
  aside, .ads, .sidebar, .nav-menu
`;

export default router;
