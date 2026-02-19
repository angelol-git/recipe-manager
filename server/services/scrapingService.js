import TurndownService from "turndown";
import { Impit } from "impit";
import * as cheerio from "cheerio";

const REMOVE_SELECTORS = `
  style, script, nav, footer, header, .drawer-nav, .site-header,
  .social-menu, .jump-button-group, .post-disclosure, .skip-link,
  .screen-reader-text, .faq-section, .savetherecipe,
  iframe, img, svg, picture, video, noscript, button, form, 
  aside, .ads, .sidebar, .nav-menu
`;

export async function extractRecipeFromUrl(url) {
  const impit = new Impit({
    browser: "chrome",
    ignoreTlsErrors: true,
  });

  const response = await impit.fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  const jsonLd = parseJsonLd($);
  if (jsonLd) {
    return jsonLd;
  }

  return parseHtml($);
}

function parseJsonLd($) {
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

function parseHtml($) {
  $(REMOVE_SELECTORS).remove();
  const bodyInnerHtml = $("body").html();
  const turndownService = new TurndownService({
    headingStyle: "atx",
    hr: "---",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
  });

  const markdown = turndownService.turndown(bodyInnerHtml);
  return markdown.replace(/\n\s*\n\s*\n/g, "\n\n");
}
