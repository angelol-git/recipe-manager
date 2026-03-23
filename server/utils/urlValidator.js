import { URL } from "url";

export function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    
    // Only allow http/https protocols
    if (!["http:", "https:"].includes(url.protocol)) {
      return false;
    }
    
    // Block private IP ranges and localhost
    const hostname = url.hostname.toLowerCase();
    const blockedPatterns = [
      /^localhost$/,
      /^127\./,                          // 127.0.0.0/8
      /^10\./,                           // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./,                     // 192.168.0.0/16
      /^169\.254\./,                     // Link-local addresses
      /^0\./,                            // Current network
      /^::1$/,                           // IPv6 localhost
      /^fc00:/i,                         // IPv6 unique local addresses
      /^fe80:/i,                         // IPv6 link-local addresses
    ];
    
    return !blockedPatterns.some(pattern => pattern.test(hostname));
  } catch {
    return false;
  }
}

export function normalizeUrl(input) {
  const url = new URL(input);

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();
  url.hash = "";

  const trackingParams = [
    "fbclid",
    "gclid",
    "dclid",
    "msclkid",
    "mc_cid",
    "mc_eid",
  ];

  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("utm_") || trackingParams.includes(key)) {
      url.searchParams.delete(key);
    }
  }

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}
