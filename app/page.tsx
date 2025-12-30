"use client";

import { useRecipes } from "./RecipeContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const { recipes, addRecipe } = useRecipes();

  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");

  async function makeNewRecipe() {
    const t = newTitle.trim();
    if (!t) return;
  
    try {
      const id = await addRecipe(t);
      setNewTitle("");
      router.push(`/recipes/${id}`);
    } catch (e) {
      console.warn("Failed to create recipe:", e);
    }
  }

  const filtered = (() => {
    if (!search.trim()) return recipes;
    try {
      const re = new RegExp(search, "i");
      return recipes.filter((r) => re.test(r.title));
    } catch {
      // invalid regex — show all rather than breaking UX
      return recipes;
    }
  })();

  return (
    <main className="p-6 max-w-4xl mx-auto text-white">
      <header>
        <h1 className="text-3xl font-bold mb-6">Recipes</h1>
      </header>

      {/* Create new recipe */}
      <div className="flex gap-2 mb-4">
        <label htmlFor="newRecipeTitle" className="sr-only">
          New recipe title
        </label>
        <input
          id="newRecipeTitle"
          className="border rounded p-2 flex-1 text-white bg-black placeholder:text-gray-300 focus:ring-2 focus:ring-blue-400"
          placeholder="New recipe title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          aria-label="New recipe title"
        />

        <button
          className="rounded px-4 py-2 bg-blue-600 text-white focus:ring-2 focus:ring-blue-300"
          aria-label="Create new recipe"
          onClick={makeNewRecipe}
        >
          Add
        </button>
      </div>

      {/* Regex search */}
      <label htmlFor="recipeSearch" className="sr-only">
        Search recipes
      </label>
      <input
        id="recipeSearch"
        className="border rounded p-2 w-full text-white bg-black placeholder:text-gray-300 mb-6 focus:ring-2 focus:ring-blue-400"
        placeholder="Search recipes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search recipes"
      />

      {/* Cards */}
      <section aria-label="Recipe list">
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <article
              key={r.id}
              role="button"
              tabIndex={0}
              aria-label={`Open recipe ${r.title}`}
              className="border rounded p-4 cursor-pointer hover:bg-gray-800 transition flex gap-4 focus:ring-2 focus:ring-yellow-400 outline-none"
              onClick={() => router.push(`/recipes/${r.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter") router.push(`/recipes/${r.id}`);
              }}
            >
              {r.image && (
                <img
                  src={r.image}
                  alt={`Cover image for ${r.title}`}
                  className="w-20 h-20 object-cover rounded"
                />
              )}

              <div>
                <p className="text-lg font-semibold">{r.title}</p>
                <p className="text-sm text-gray-400">
                  {r.steps.length} {r.steps.length === 1 ? "step" : "steps"}
                </p>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-6 text-gray-400" role="status">
            No matches found.
          </p>
        )}
      </section>
    </main>
  );
}
