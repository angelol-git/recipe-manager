PRAGMA foreign_keys = ON;

ALTER TABLE recipe_version_ingredients
ADD COLUMN completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1));

ALTER TABLE recipe_version_steps
ADD COLUMN completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1));
