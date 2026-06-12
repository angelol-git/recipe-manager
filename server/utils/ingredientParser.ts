/*
 * Manual ingredient parser used as a fallback to convert ingredient strings
 * into the structured ingredient fields stored in the database.
 *
 * TODO: Remove or reduce this once structured ingredient output is returned
 * directly from the AI, if that path proves reliable enough.
 *
 * 1 and 1/2 cups should convert to 1 1/2 cups
 */
export type ParsedIngredient = {
  raw_text: string;
  ingredient_name: string;
  quantity_value: number | null;
  quantity_text: string | null;
  unit: string | null;
  alternate_quantity_value: number | null;
  alternate_quantity_text: string | null;
  alternate_unit: string | null;
  note: string | null;
  is_optional: boolean;
};

type IngredientQuantityAndUnit = {
  quantityText: string | null;
  unit: string | null;
  alternateQuantityText: string | null;
  alternateUnit: string | null;
  remainingText: string;
};

const COMMON_UNITS = [
  "teaspoon",
  "teaspoons",
  "tsp",
  "tablespoon",
  "tablespoons",
  "tbsp",
  "cup",
  "cups",
  "ounce",
  "ounces",
  "oz",
  "pound",
  "pounds",
  "lb",
  "lbs",
  "gram",
  "grams",
  "g",
  "kilogram",
  "kilograms",
  "kg",
  "milliliter",
  "milliliters",
  "ml",
  "liter",
  "liters",
  "l",
  "pinch",
  "clove",
  "cloves",
  "can",
  "cans",
  "package",
  "packages",
  "stick",
  "sticks",
];

const QUANTITY_PATTERN = /^(?:\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/;
const COMMON_UNITS_BY_LENGTH = [...COMMON_UNITS].sort(
  (left, right) => right.length - left.length,
);
const UNIT_ALIASES: Record<string, string> = {
  teaspoon: "tsp",
  teaspoons: "tsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
};

function toCanonicalUnit(unit: string): string {
  const trimmed = unit.trim();
  const normalized = trimmed.toLowerCase();

  return UNIT_ALIASES[normalized] ?? trimmed;
}

export function normalizeIngredientUnit(
  unit: string | null | undefined,
): string | null {
  if (!unit) {
    return null;
  }

  return toCanonicalUnit(unit);
}

function normalizeIngredientText(line: string): string {
  return line
    .replace(/\b(tablespoons?|teaspoons?)\b/gi, (match) => {
      return toCanonicalUnit(match);
    })
    .trim();
}

function removeOptionalMarker(input: string): string {
  return input
    .replace(/\boptional\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function fractionToNumber(value: string): number | null {
  const trimmed = value.trim();

  if (/^\d+\s+\d+\/\d+$/.test(trimmed)) {
    const [whole, fraction] = trimmed.split(/\s+/);
    const fractionValue = fractionToNumber(fraction);
    return fractionValue === null ? null : Number(whole) + fractionValue;
  }

  if (/^\d+\/\d+$/.test(trimmed)) {
    const [numerator, denominator] = trimmed.split("/").map(Number);
    if (!denominator) return null;
    return numerator / denominator;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/*
 * Extracts text in parentheses or after a comma.
 * Example: "flour (sifted)" or "flour, sifted".
 * Returns: text: "flour" note: "sifted"
 */
function extractTrailingNote(input: string): {
  text: string;
  note: string | null;
} {
  const trimmed = input.trim();

  const parenMatch = trimmed.match(/^(.*)\(([^()]+)\)\s*$/);

  if (parenMatch) {
    return {
      //removes trailing commas
      text: parenMatch[1].trim().replace(/,\s*$/, ""),
      note: parenMatch[2].trim(),
    };
  }

  const commaIndex = trimmed.lastIndexOf(",");
  if (commaIndex !== -1) {
    const text = trimmed.slice(0, commaIndex).trim();
    const note = trimmed.slice(commaIndex + 1).trim();

    if (text && note) {
      return { text, note };
    }
  }

  return { text: trimmed, note: null };
}

function parseIngredientQuantity(input: string): {
  quantityText: string | null;
  remainder: string;
} | null {
  const match = input.match(QUANTITY_PATTERN);

  if (!match) {
    return null;
  }

  return {
    quantityText: match[0].trim(),
    remainder: input.slice(match[0].length),
  };
}

function parseIngredientUnit(input: string): {
  unit: string | null;
  remainder: string;
} {
  const trimmed = input.trimStart();

  for (const unit of COMMON_UNITS_BY_LENGTH) {
    if (!trimmed.toLowerCase().startsWith(unit)) {
      continue;
    }

    const nextCharacter = trimmed.charAt(unit.length);
    if (nextCharacter && !/\s|\(/.test(nextCharacter)) {
      continue;
    }

    return {
      unit: normalizeIngredientUnit(trimmed.slice(0, unit.length)),
      remainder: trimmed.slice(unit.length),
    };
  }

  return {
    unit: null,
    remainder: trimmed,
  };
}

function parseAlternateIngredientUnit(input: string): {
  alternateQuantityText: string | null;
  alternateUnit: string | null;
  remainder: string;
} {
  const trimmed = input.trimStart();

  if (!trimmed.startsWith("(")) {
    return {
      alternateQuantityText: null,
      alternateUnit: null,
      remainder: trimmed,
    };
  }

  const closingParenIndex = trimmed.indexOf(")");
  if (closingParenIndex === -1) {
    return {
      alternateQuantityText: null,
      alternateUnit: null,
      remainder: trimmed,
    };
  }

  const insideParens = trimmed.slice(1, closingParenIndex).trim();
  const quantityMatch = insideParens.match(QUANTITY_PATTERN);

  if (!quantityMatch) {
    return {
      alternateQuantityText: null,
      alternateUnit: null,
      remainder: trimmed,
    };
  }

  const alternateQuantityText = quantityMatch[0].trim();
  const alternateUnitText = insideParens.slice(quantityMatch[0].length).trim();

  return {
    alternateQuantityText,
    alternateUnit: normalizeIngredientUnit(alternateUnitText || null),
    remainder: trimmed.slice(closingParenIndex + 1),
  };
}

function parseIngredientQuantityAndUnit(
  input: string,
): IngredientQuantityAndUnit | null {
  const quantity = parseIngredientQuantity(input);

  if (!quantity) {
    return null;
  }

  const unit = parseIngredientUnit(quantity.remainder);
  const alternate = parseAlternateIngredientUnit(unit.remainder);
  // Remaining ingredient text after removing quantity, unit, and alternate unit.
  // Example: "1 cup (240 ml) flour, sifted" -> "flour, sifted"
  const remainingText = alternate.remainder.trim();

  if (!remainingText) {
    return null;
  }

  return {
    quantityText: quantity.quantityText,
    unit: unit.unit,
    alternateQuantityText: alternate.alternateQuantityText,
    alternateUnit: alternate.alternateUnit,
    remainingText,
  };
}

export function parseIngredientLine(line: string): ParsedIngredient {
  //Replaces teaspoons to tsp and tablespoons to tbsp
  const rawText = normalizeIngredientText(line);
  const isOptional = /\boptional\b/i.test(rawText);

  //Removes optional word and removes any extra spaces
  const sanitized = removeOptionalMarker(rawText);
  const quantityAndUnit = parseIngredientQuantityAndUnit(sanitized);

  // No quantity and unit example. "Pinch of salt", just return the text
  if (!quantityAndUnit) {
    const { text, note } = extractTrailingNote(sanitized);
    return {
      raw_text: rawText,
      ingredient_name: text,
      quantity_value: null,
      quantity_text: null,
      unit: null,
      alternate_quantity_value: null,
      alternate_quantity_text: null,
      alternate_unit: null,
      note,
      is_optional: isOptional,
    };
  }

  const { text: ingredientName, note } = extractTrailingNote(
    quantityAndUnit.remainingText,
  );

  return {
    raw_text: rawText,
    ingredient_name: ingredientName,
    quantity_value: quantityAndUnit.quantityText
      ? fractionToNumber(quantityAndUnit.quantityText)
      : null,
    quantity_text: quantityAndUnit.quantityText,
    unit: quantityAndUnit.unit,
    alternate_quantity_value: quantityAndUnit.alternateQuantityText
      ? fractionToNumber(quantityAndUnit.alternateQuantityText)
      : null,
    alternate_quantity_text: quantityAndUnit.alternateQuantityText,
    alternate_unit: quantityAndUnit.alternateUnit,
    note,
    is_optional: isOptional,
  };
}
