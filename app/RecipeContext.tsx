"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { fetchGraphQL } from "./lib/graphql";

const uid = () => Math.random().toString(36).slice(2, 10);
const LS_KEY = "recipe-app/recipes/v1";

export type Recipe = {
  id: string;
  title: string;
  steps: string[];
  image?: string | null;
  done?: boolean[];
};

type RecipeContextType = {
  recipes: Recipe[];
  online: boolean; // whether GraphQL is reachable
  addRecipe: (title: string) => Promise<string>;
  updateRecipe: (id: string, updated: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  refetch: () => Promise<void>;
};

const RecipeContext = createContext<RecipeContextType | null>(null);

function normalizeRecipe(r: Recipe): Recipe {
  const steps = Array.isArray(r.steps) ? r.steps : [];
  const done = Array.isArray(r.done) ? r.done : [];
  return {
    ...r,
    steps,
    image: r.image ?? null,
    done: done.length === steps.length ? done : Array(steps.length).fill(false),
  };
}

function loadLocal(): Recipe[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRecipe);
  } catch {
    return [];
  }
}

function saveLocal(recipes: Recipe[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(recipes));
  } catch {
    // ignore
  }
}

async function fetchAllFromAPI(): Promise<Recipe[]> {
  // NOTE: query shape must match your server schema
  const data = await fetchGraphQL<{
    recipes: { id: string; title: string; steps: string[] }[];
  }>(`
    query {
      recipes { id title steps }
    }
  `);

  return (data.recipes ?? []).map((r) =>
    normalizeRecipe({
      id: r.id,
      title: r.title,
      steps: r.steps ?? [],
      image: null,
      done: Array((r.steps ?? []).length).fill(false),
    })
  );
}

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [online, setOnline] = useState(false);

  async function refetch() {
    try {
      const apiRecipes = await fetchAllFromAPI();
      setRecipes(apiRecipes);
      setOnline(true);
      saveLocal(apiRecipes);
    } catch (e) {
      console.warn("[refetch] GraphQL unreachable, using local cache:", e);
      setOnline(false);
      const local = loadLocal();
      setRecipes(local);
    }
  }

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    saveLocal(recipes);
  }, [recipes]);

  async function addRecipe(title: string): Promise<string> {
    const t = title.trim();
    if (!t) return "";
  
    const tempId = uid();
    const optimistic: Recipe = normalizeRecipe({
      id: tempId,
      title: t,
      steps: [],
      image: null,
      done: [],
    });
    setRecipes((prev) => [...prev, optimistic]);
  
    try {
      const data = await fetchGraphQL<{
        createRecipe: { id: string; title: string; steps: string[]; image?: string | null; done?: boolean[] };
      }>(
        `
        mutation($input: RecipeInput!) {
          createRecipe(input: $input) {
            id
            title
            steps
            image
            done
          }
        }
        `,
        { input: { title: t, steps: [], done: [] } }
      );
  
      const created = normalizeRecipe(data.createRecipe as Recipe);
  
      setRecipes((prev) =>
        prev.map((r) => (r.id === tempId ? created : r))
      );
  
      setOnline(true);
      return created.id;
    } catch (e) {
      console.warn("[addRecipe] API failed, kept local-only recipe:", e);
      setOnline(false);
      return tempId;
    }
  }
  

  function updateRecipe(id: string, updated: Partial<Recipe>) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? normalizeRecipe({ ...r, ...updated }) : r))
    );

    (async () => {
      try {
        await fetchGraphQL(
          `
          mutation($id: ID!, $patch: RecipePatch!) {
            updateRecipe(id: $id, patch: $patch) { id }
          }
          `,
          { id, patch: updated }
        );
        setOnline(true);
      } catch (e) {
        console.warn("[updateRecipe] API failed, local-only state retained:", e);
        setOnline(false);
      }
    })();
  }

  function deleteRecipe(id: string) {
    setRecipes((prev) => prev.filter((r) => r.id !== id));

    (async () => {
      try {
        await fetchGraphQL(
          `
          mutation($id: ID!) {
            deleteRecipe(id: $id)
          }
          `,
          { id }
        );
        setOnline(true);
      } catch (e) {
        console.warn("[deleteRecipe] API failed, local-only deletion retained:", e);
        setOnline(false);
      }
    })();
  }

  const value = useMemo<RecipeContextType>(
    () => ({ recipes, online, addRecipe, updateRecipe, deleteRecipe, refetch }),
    [recipes, online]
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes(): RecipeContextType {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipes must be used within <RecipeProvider>");
  return ctx;
}
