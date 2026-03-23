import process from "node:process";
import { performance } from "node:perf_hooks";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  createPrompt,
  getModelName,
  validateAiResponse,
} from "../services/aiService.js";
import { extractRecipeFromUrl } from "../services/scrapingService.js";
import { aiRecipeSchema } from "../validation/aiSchemas.js";

dotenv.config();

const DEFAULT_URL = "https://sallysbakingaddiction.com/blueberry-muffins/";

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    model: getModelName(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--url" && next) {
      options.url = next;
      i += 1;
    } else if (arg === "--model" && next) {
      options.model = next;
      i += 1;
    }
  }

  return options;
}

function formatMs(value) {
  return `${value.toFixed(2)} ms`;
}

function getInputTokens(usageMetadata) {
  return (
    (usageMetadata.promptTokenCount ?? 0) +
    (usageMetadata.toolUsePromptTokenCount ?? 0)
  );
}

function getExtractedTitle(extractedContext) {
  if (!extractedContext || typeof extractedContext !== "object") {
    return null;
  }

  return (
    extractedContext.name ??
    extractedContext.headline ??
    extractedContext.title ??
    null
  );
}

function serializeContextData(urlContent) {
  return typeof urlContent === "object"
    ? JSON.stringify(urlContent, null, 2)
    : urlContent;
}

function printUsage(label, usageMetadata) {
  console.log(`${label}:`);
  console.log(
    `  promptTokenCount: ${usageMetadata.promptTokenCount ?? "missing"}`,
  );
  console.log(
    `  toolUsePromptTokenCount: ${usageMetadata.toolUsePromptTokenCount ?? 0}`,
  );
  console.log(
    `  candidatesTokenCount: ${usageMetadata.candidatesTokenCount ?? "missing"}`,
  );
  console.log(
    `  totalTokenCount: ${usageMetadata.totalTokenCount ?? "missing"}`,
  );
}

async function runScrapePath(ai, model, url) {
  const extractedContext = await extractRecipeFromUrl(url);
  const extractedTitle = getExtractedTitle(extractedContext);

  if (!extractedTitle) {
    throw new Error("Scrape path did not extract a valid recipe title.");
  }

  const contextData = serializeContextData(extractedContext);
  const prompt = createPrompt(url, null, contextData);

  const startedAt = performance.now();
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(aiRecipeSchema),
      temperature: 0.7,
    },
  });
  const elapsedMs = performance.now() - startedAt;

  if (!response.usageMetadata) {
    throw new Error("Scrape path response is missing usageMetadata.");
  }

  const parsedRecipe = validateAiResponse(response, url);

  return {
    elapsedMs,
    extractedTitle,
    parsedTitle: parsedRecipe.title,
    usageMetadata: response.usageMetadata,
  };
}

async function runUrlContextPath(ai, model, url) {
  const prompt = createPrompt(url, null, null);

  const startedAt = performance.now();
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      tools: [{ urlContext: {} }],
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(aiRecipeSchema),
      temperature: 0.7,
    },
  });
  const elapsedMs = performance.now() - startedAt;

  if (!response.usageMetadata) {
    throw new Error("urlContext path response is missing usageMetadata.");
  }

  const urlContextMetadata = response.candidates?.[0]?.urlContextMetadata;
  const retrievedUrls = urlContextMetadata?.urlMetadata ?? [];

  if (!retrievedUrls.length) {
    throw new Error("urlContext path did not return retrieval metadata.");
  }

  const parsedRecipe = validateAiResponse(response, url);

  return {
    elapsedMs,
    parsedTitle: parsedRecipe.title,
    usageMetadata: response.usageMetadata,
    urlContextMetadata,
  };
}

async function run() {
  const { url, model } = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log("Benchmarking scrape vs urlContext");
  console.log(`URL: ${url}`);
  console.log(`Model: ${model}`);
  console.log("");

  const scrapeResult = await runScrapePath(ai, model, url);
  printUsage("Scrape path", scrapeResult.usageMetadata);
  console.log(`  elapsed: ${formatMs(scrapeResult.elapsedMs)}`);
  console.log(`  extractedTitle: ${scrapeResult.extractedTitle}`);
  console.log(`  parsedTitle: ${scrapeResult.parsedTitle}`);
  console.log("");

  const urlContextResult = await runUrlContextPath(ai, model, url);
  printUsage("urlContext path", urlContextResult.usageMetadata);
  console.log(`  elapsed: ${formatMs(urlContextResult.elapsedMs)}`);
  console.log(`  parsedTitle: ${urlContextResult.parsedTitle}`);
  console.log("  urlContextMetadata:");
  console.log(JSON.stringify(urlContextResult.urlContextMetadata, null, 2));
  console.log("");

  const scrapeInputTokens = getInputTokens(scrapeResult.usageMetadata);
  const urlContextInputTokens = getInputTokens(urlContextResult.usageMetadata);
  const scrapeTotalTokens = scrapeResult.usageMetadata.totalTokenCount ?? 0;
  const urlContextTotalTokens =
    urlContextResult.usageMetadata.totalTokenCount ?? 0;
  const inputDelta = Math.abs(scrapeInputTokens - urlContextInputTokens);
  const totalDelta = Math.abs(scrapeTotalTokens - urlContextTotalTokens);

  console.log("Comparison summary:");
  console.log(`  scrape input tokens: ${scrapeInputTokens}`);
  console.log(`  urlContext input tokens: ${urlContextInputTokens}`);
  console.log(`  scrape total tokens: ${scrapeTotalTokens}`);
  console.log(`  urlContext total tokens: ${urlContextTotalTokens}`);
  console.log(`  absolute input token delta: ${inputDelta}`);
  console.log(`  absolute total token delta: ${totalDelta}`);
  console.log(
    `  fewer input tokens: ${
      scrapeInputTokens <= urlContextInputTokens ? "scrape" : "urlContext"
    }`,
  );
  console.log(
    `  fewer total tokens: ${
      scrapeTotalTokens <= urlContextTotalTokens ? "scrape" : "urlContext"
    }`,
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
