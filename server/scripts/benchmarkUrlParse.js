import process from "node:process";
import { performance } from "node:perf_hooks";
import {
  extractJsonLdRecipeFromUrl,
  extractMarkdownFromUrl,
  extractRecipeFromUrl,
  fetchHtmlFromUrl,
  getUrlContext,
} from "../services/urlContentService.js";

const DEFAULT_URL =
  "https://sallysbakingaddiction.com/blueberry-muffins";

function parseArgs(argv) {
  const options = {
    url: DEFAULT_URL,
    iterations: 1,
    warmup: 0,
    mode: "recipe",
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

  if (!["fetch", "jsonld", "markdown", "recipe", "context"].includes(options.mode)) {
    throw new Error(
      '--mode must be one of "fetch", "jsonld", "markdown", "recipe", or "context"',
    );
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
    return `${result.length} chars`;
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

function getBenchmark(mode) {
  switch (mode) {
    case "fetch":
      return fetchHtmlFromUrl;
    case "jsonld":
      return extractJsonLdRecipeFromUrl;
    case "markdown":
      return extractMarkdownFromUrl;
    case "context":
      return getUrlContext;
    case "recipe":
    default:
      return extractRecipeFromUrl;
  }
}

async function run() {
  const { url, iterations, warmup, mode } = parseArgs(process.argv.slice(2));
  const benchmark = getBenchmark(mode);
  const durations = [];
  let lastResult = null;

  console.log("Benchmarking URL parsing");
  console.log(`Mode: ${mode}`);
  console.log(`URL: ${url}`);
  console.log(`Iterations: ${iterations}`);


  for (let i = 0; i < warmup; i += 1) {
    await benchmark(url);
  }

  const startedAt = performance.now();

  for (let i = 0; i < iterations; i += 1) {
    const iterationStartedAt = performance.now();
    lastResult = await benchmark(url);
    const elapsedMs = performance.now() - iterationStartedAt;
    durations.push(elapsedMs);
    console.log(`#${i + 1} ${formatMs(elapsedMs)} | ${summarizeResult(lastResult)}`);
  }

  const totalMs = performance.now() - startedAt;
  const sorted = [...durations].sort((a, b) => a - b);
  const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;

  console.log("");
  console.log(`Completed in ${formatMs(totalMs)}`);
  console.log(`avg ${formatMs(average)}`);
  console.log(`min ${formatMs(sorted[0])}`);
  console.log(`max ${formatMs(sorted[sorted.length - 1])}`);
  console.log(`Last result: ${summarizeResult(lastResult)}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
