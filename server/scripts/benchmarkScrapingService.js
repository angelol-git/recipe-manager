import process from "node:process";
import { performance } from "node:perf_hooks";
import {
  extractRecipeFromUrl,
  extractRecipeFromHtml,
  fetchHtmlFromUrl,
} from "../services/scrapingService.js";

function parseArgs(argv) {
  const options = {
    url:  "https://sallysbakingaddiction.com/blueberry-muffins/#tasty-recipes-67559",
    iterations: 1,
    warmup: 0,
    mode: "full",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--url" && next) {
      options.url = next;
      i += 1;
    } else if (arg === "--iterations" && next) {
      options.iterations = Number.parseInt(next, 10);
      i += 1;
    } else if (arg === "--warmup" && next) {
      options.warmup = Number.parseInt(next, 10);
      i += 1;
    } else if (arg === "--mode" && next) {
      options.mode = next;
      i += 1;
    }
  }

  if (!options.url) {
    throw new Error("--url is required");
  }

  if (!Number.isInteger(options.iterations) || options.iterations < 1) {
    throw new Error("--iterations must be an integer greater than 0");
  }

  if (!Number.isInteger(options.warmup) || options.warmup < 0) {
    throw new Error("--warmup must be an integer greater than or equal to 0");
  }

  if (!["full", "fetch", "parse"].includes(options.mode)) {
    throw new Error('--mode must be one of "full", "fetch", or "parse"');
  }

  return options;
}

function formatMs(value) {
  return `${value.toFixed(2)} ms`;
}

function percentile(sortedValues, p) {
  const index = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, index)];
}

function summarizeResult(result) {
  if (typeof result === "string") {
    return `markdown (${result.length} chars)`;
  }

  if (result && typeof result === "object") {
    const type = Array.isArray(result["@type"])
      ? result["@type"].join(", ")
      : result["@type"] ?? "object";
    const title = result.name ?? result.headline ?? result.title ?? null;

    return title ? `${type}: ${title}` : type;
  }

  return String(result);
}

function formatResult(result) {
  if (typeof result === "string") {
    return result;
  }

  return JSON.stringify(result, null, 2);
}

async function benchmarkFull(url, iterations) {
  const durations = [];
  let lastResult = null;

  for (let i = 0; i < iterations; i += 1) {
    const startedAt = performance.now();
    lastResult = await extractRecipeFromUrl(url);
    durations.push(performance.now() - startedAt);
  }

  return { durations, lastResult };
}

async function benchmarkFetch(url, iterations) {
  const durations = [];
  let lastHtml = "";

  for (let i = 0; i < iterations; i += 1) {
    const startedAt = performance.now();
    lastHtml = await fetchHtmlFromUrl(url);
    durations.push(performance.now() - startedAt);
  }

  return { durations, lastResult: lastHtml };
}

function benchmarkParse(html, iterations) {
  const durations = [];
  let lastResult = null;

  for (let i = 0; i < iterations; i += 1) {
    const startedAt = performance.now();
    lastResult = extractRecipeFromHtml(html);
    durations.push(performance.now() - startedAt);
  }

  return { durations, lastResult, htmlLength: html.length };
}

async function run() {
  const { url, iterations, warmup, mode } = parseArgs(process.argv.slice(2));

  if (mode === "parse") {
    const html = await fetchHtmlFromUrl(url);
    for (let i = 0; i < warmup; i += 1) {
      extractRecipeFromHtml(html);
    }

    const startedAt = performance.now();
    const result = benchmarkParse(html, iterations);
    const totalMs = performance.now() - startedAt;
    const sorted = [...result.durations].sort((a, b) => a - b);
    const average =
      result.durations.reduce((sum, value) => sum + value, 0) /
      result.durations.length;

    console.log("Benchmarking scraping service");
    console.log(`Mode: ${mode}`);
    console.log(`URL: ${url}`);
    console.log(`Iterations: ${iterations}`);
    console.log(`Warmup: ${warmup}`);
    console.log(`HTML size: ${result.htmlLength} chars`);
    console.log("");
    console.log(`Completed in ${formatMs(totalMs)}`);
    console.log(`avg ${formatMs(average)}`);
    console.log(`min ${formatMs(sorted[0])}`);
    console.log(`p50 ${formatMs(percentile(sorted, 50))}`);
    console.log(`p95 ${formatMs(percentile(sorted, 95))}`);
    console.log(`max ${formatMs(sorted[sorted.length - 1])}`);
    console.log(`Result: ${summarizeResult(result.lastResult)}`);
    console.log("");
    console.log("Extracted result:");
    console.log(formatResult(result.lastResult));
    return;
  }

  const benchmark = mode === "fetch" ? benchmarkFetch : benchmarkFull;

  for (let i = 0; i < warmup; i += 1) {
    await benchmark(url, 1);
  }

  const startedAt = performance.now();
  const result = await benchmark(url, iterations);
  const totalMs = performance.now() - startedAt;
  const sorted = [...result.durations].sort((a, b) => a - b);
  const average =
    result.durations.reduce((sum, value) => sum + value, 0) /
    result.durations.length;

  console.log("Benchmarking scraping service");
  console.log(`Mode: ${mode}`);
  console.log(`URL: ${url}`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Warmup: ${warmup}`);
  console.log("");
  console.log(`Completed in ${formatMs(totalMs)}`);
  console.log(`avg ${formatMs(average)}`);
  console.log(`min ${formatMs(sorted[0])}`);
  console.log(`p50 ${formatMs(percentile(sorted, 50))}`);
  console.log(`p95 ${formatMs(percentile(sorted, 95))}`);
  console.log(`max ${formatMs(sorted[sorted.length - 1])}`);

  if (mode === "fetch" && typeof result.lastResult === "string") {
    console.log(`HTML size: ${result.lastResult.length} chars`);
  } else {
    console.log(`Result: ${summarizeResult(result.lastResult)}`);
    console.log("");
    console.log("Extracted result:");
    // console.log(formatResult(result.lastResult));
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
