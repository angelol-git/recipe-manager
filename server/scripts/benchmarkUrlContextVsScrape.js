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
import {
  extractJsonLdRecipeFromUrl,
  extractMarkdownFromUrl,
} from "../services/urlContentService.js";
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

async function generateRecipe(ai, model, prompt, extraConfig = {}) {
  const startedAt = performance.now();
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(aiRecipeSchema),
      temperature: 0.7,
      ...extraConfig,
    },
  });
  const elapsedMs = performance.now() - startedAt;

  if (!response.usageMetadata) {
    throw new Error("Response is missing usageMetadata.");
  }

  return { response, elapsedMs };
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

async function runJsonLdPath(ai, model, url) {
  const extractedContext = await extractJsonLdRecipeFromUrl(url);
  const extractedTitle = getExtractedTitle(extractedContext);

  if (!extractedContext || !extractedTitle) {
    throw new Error("JSON-LD path did not extract a valid recipe object.");
  }

  const prompt = createPrompt(url, null, serializeContextData(extractedContext));
  const { response, elapsedMs } = await generateRecipe(ai, model, prompt);
  const parsedRecipe = validateAiResponse(response, url);

  return {
    elapsedMs,
    extractedTitle,
    parsedTitle: parsedRecipe.title,
    usageMetadata: response.usageMetadata,
  };
}

async function runMarkdownPath(ai, model, url) {
  const extractedContext = await extractMarkdownFromUrl(url);

  if (!extractedContext || typeof extractedContext !== "string") {
    throw new Error("Markdown path did not extract markdown content.");
  }

  const prompt = createPrompt(url, null, extractedContext);
  const { response, elapsedMs } = await generateRecipe(ai, model, prompt);
  const parsedRecipe = validateAiResponse(response, url);

  return {
    elapsedMs,
    markdownChars: extractedContext.length,
    parsedTitle: parsedRecipe.title,
    usageMetadata: response.usageMetadata,
  };
}

async function runUrlContextPath(ai, model, url) {
  const prompt = createPrompt(url, null, null);
  const { response, elapsedMs } = await generateRecipe(ai, model, prompt, {
    tools: [{ urlContext: {} }],
  });
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

function printComparisonLine(label, result) {
  console.log(`  ${label} input tokens: ${getInputTokens(result.usageMetadata)}`);
  console.log(`  ${label} total tokens: ${result.usageMetadata.totalTokenCount ?? 0}`);
}

function getCheapestLabel(entries, selector) {
  return entries.reduce((best, current) =>
    selector(current.result) < selector(best.result) ? current : best,
  ).label;
}

async function run() {
  const { url, model } = parseArgs(process.argv.slice(2));
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  console.log("Benchmarking jsonld vs markdown vs urlContext");
  console.log(`URL: ${url}`);
  console.log(`Model: ${model}`);
  console.log("");

  const jsonLdResult = await runJsonLdPath(ai, model, url);
  printUsage("JSON-LD path", jsonLdResult.usageMetadata);
  console.log(`  elapsed: ${formatMs(jsonLdResult.elapsedMs)}`);
  console.log(`  extractedTitle: ${jsonLdResult.extractedTitle}`);
  console.log(`  parsedTitle: ${jsonLdResult.parsedTitle}`);
  console.log("");

  const markdownResult = await runMarkdownPath(ai, model, url);
  printUsage("Markdown path", markdownResult.usageMetadata);
  console.log(`  elapsed: ${formatMs(markdownResult.elapsedMs)}`);
  console.log(`  markdownChars: ${markdownResult.markdownChars}`);
  console.log(`  parsedTitle: ${markdownResult.parsedTitle}`);
  console.log("");

  const urlContextResult = await runUrlContextPath(ai, model, url);
  printUsage("urlContext path", urlContextResult.usageMetadata);
  console.log(`  elapsed: ${formatMs(urlContextResult.elapsedMs)}`);
  console.log(`  parsedTitle: ${urlContextResult.parsedTitle}`);
  console.log("  urlContextMetadata:");
  console.log(JSON.stringify(urlContextResult.urlContextMetadata, null, 2));
  console.log("");

  const results = [
    { label: "jsonld", result: jsonLdResult },
    { label: "markdown", result: markdownResult },
    { label: "urlContext", result: urlContextResult },
  ];

  console.log("Comparison summary:");
  printComparisonLine("jsonld", jsonLdResult);
  printComparisonLine("markdown", markdownResult);
  printComparisonLine("urlContext", urlContextResult);
  console.log(
    `  cheapest input path: ${getCheapestLabel(
      results,
      (result) => getInputTokens(result.usageMetadata),
    )}`,
  );
  console.log(
    `  cheapest total path: ${getCheapestLabel(
      results,
      (result) => result.usageMetadata.totalTokenCount ?? Number.POSITIVE_INFINITY,
    )}`,
  );
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
