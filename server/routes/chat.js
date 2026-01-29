import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";
import { Impit } from "impit";
import { writeFile } from "fs/promises";
import * as cheerio from "cheerio";
import { generateResponse, validateAiResponse, createPrompt } from "./ai.js";
import { url } from "inspector";

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

    //Check if message contains url
    let urlContent = await checkMessageURL(message);

    const prompt = createPrompt(
      message,
      recipeVersion || null,
      JSON.stringify(urlContent) || null,
    );

    const aiResponse = await generateResponse(prompt);

    const reply = validateAiResponse({
      response: aiResponse,
      recipeId: recipeId ?? null,
      userId: req.user.id,
      message,
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

async function checkMessageURL(message) {
  const URL_REGEX = /(https?:\/\/[^\s]+)/i;
  const containsUrl = message.match(URL_REGEX);
  const url = containsUrl ? containsUrl[1] : null;
  if (url) {
    const impit = new Impit({
      browser: "chrome",
      ignoreTlsErrors: true,
    });

    const response = await impit.fetch(url);
    const html = await response.text();

    //#1: get information from application/db
    const jsonLd = checkJsonLd(html);
    return jsonLd;
    // await writeFile("output.html", jsonLd, "utf8");
    //#2: get information from html

    // $(REMOVE_SELECTORS).remove();
    // console.log(bodyInnerHtml)
  }
}

function checkJsonLd(html) {
  const $ = cheerio.load(html);
  // Select all <script type="application/ld+json"> tags
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

const REMOVE_SELECTORS = `
  style,
  nav,
  footer,
  header,
  iframe,
  img,
  svg,
  picture,
  video,
  audio,
  canvas,
  figure,
  noscript,
  button,
  form,
  input,
  textarea,
  select,
  option,
  aside,
  ads
`;

export default router;
