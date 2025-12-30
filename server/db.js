import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "data", "recipes.json");

export const uid = () => Math.random().toString(36).slice(2, 10);

export async function readAll() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

export async function writeAll(recipes) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(recipes, null, 2), "utf8");
}
