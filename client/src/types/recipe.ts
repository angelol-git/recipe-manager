import type { Tag } from "./tag";

export type Recipe = {
  id: string;
  title: string;
  source_url?: string | null;
  description?: string | null;
  ingredients: string[];
  instructions: string[];
  tags: Tag[];
  created_at?: string;
};