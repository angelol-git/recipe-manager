export type Tag = {
  id: number;
  name: string;
  color: string;
};

export type EditableTagUpdate = {
  id: number;
  name?: string;
  color?: string;
};

export type DraftTag = {
  name: string;
  color: string;
};