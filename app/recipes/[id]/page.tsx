"use client";

import { useParams, useRouter } from "next/navigation";
import { useRecipes } from "../../RecipeContext";
import { useState } from "react";

export default function RecipePage() {
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";

  const router = useRouter();
  const { recipes, updateRecipe, deleteRecipe } = useRecipes();

  const recipe = recipes.find((r) => r.id === id);
  const [newStep, setNewStep] = useState("");

  if (!recipe) {
    return (
      <main className="p-6 text-white">
        <p className="mb-4" role="alert">
          Recipe not found.
        </p>
        <button className="underline" onClick={() => router.push("/")}>
          Back home
        </button>
      </main>
    );
  }

  const r = recipe;

  function addStep() {
    const s = newStep.trim();
    if (!s) return;
    updateRecipe(r.id, { steps: [...r.steps, s] });
    setNewStep("");
  }

  function editStep(index: number, text: string) {
    const updatedSteps = [...r.steps];
    updatedSteps[index] = text;
    updateRecipe(r.id, { steps: updatedSteps });
  }

  function removeStep(index: number) {
    const updatedSteps = [...r.steps];
    updatedSteps.splice(index, 1);
    updateRecipe(r.id, { steps: updatedSteps });
  }

  function toggleDone(index: number) {
    const done = [...(r.done ?? [])];
    done[index] = !done[index];
    updateRecipe(r.id, { done });
  }

  function moveStep(from: number, to: number) {
    if (to < 0 || to >= r.steps.length) return;
    const updatedSteps = [...r.steps];
    const [moved] = updatedSteps.splice(from, 1);
    updatedSteps.splice(to, 0, moved);

    let updatedDone = [...(r.done ?? [])];
    const [d] = updatedDone.splice(from, 1);
    updatedDone.splice(to, 0, d);

    updateRecipe(r.id, { steps: updatedSteps, done: updatedDone });
  }

  return (
    <main className="p-6 max-w-3xl mx-auto text-white">
      <header className="flex items-center justify-between gap-4">
        <label htmlFor="recipeTitle" className="sr-only">
          Edit recipe title
        </label>
        <input
          id="recipeTitle"
          className="text-3xl font-bold bg-transparent border-b border-gray-400 focus:outline-none p-1 w-full focus:ring-2 focus:ring-blue-400"
          value={r.title}
          onChange={(e) => updateRecipe(r.id, { title: e.target.value })}
          aria-label="Recipe title"
        />

        <div className="flex gap-2">
          <button
            className="rounded px-3 py-2 border focus:ring-2 focus:ring-blue-400"
            onClick={() => router.push("/")}
            aria-label="Back to homepage"
          >
            Back
          </button>

          <button
            className="rounded px-3 py-2 bg-red-600 text-white focus:ring-2 focus:ring-red-400"
            aria-label="Delete this recipe"
            onClick={() => {
              deleteRecipe(r.id);
              router.push("/");
            }}
          >
            Delete
          </button>
        </div>
      </header>

      {r.image && (
        <img
          src={r.image}
          alt={`Cover image of ${r.title}`}
          className="mt-4 max-h-64 object-cover rounded"
        />
      )}

      <div className="mt-6">
        <label className="block mb-2 font-semibold" htmlFor="coverImageUpload">
          Upload cover image
        </label>
        <input
          id="coverImageUpload"
          type="file"
          accept="image/*"
          aria-label="Upload cover image"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
              updateRecipe(r.id, { image: reader.result as string });
            };
            reader.readAsDataURL(file);
          }}
        />
      </div>

      <form
        className="flex gap-2 mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          addStep();
        }}
        aria-label="Add new step"
      >
        <label htmlFor="newStepInput" className="sr-only">
          New step text
        </label>
        <input
          id="newStepInput"
          className="border rounded p-2 flex-1 text-white bg-black placeholder:text-gray-300 focus:ring-2 focus:ring-blue-400"
          placeholder="Add a new step"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
        />

        <button
          className="rounded px-4 py-2 bg-green-600 text-white focus:ring-2 focus:ring-green-400"
          aria-label="Add step"
        >
          Add
        </button>
      </form>

      <ol className="mt-6 space-y-3">
        {r.steps.map((step, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={r.done?.[i] || false}
              onChange={() => toggleDone(i)}
              aria-label={`Mark step ${i + 1} as done`}
            />

            <span className="w-8 text-right select-none">{i + 1}.</span>

            <label htmlFor={`step-${i}`} className="sr-only">
              Edit step {i + 1}
            </label>
            <input
              id={`step-${i}`}
              className={`border rounded p-2 flex-1 text-white bg-black ${
                r.done?.[i] ? "line-through text-gray-500" : ""
              } focus:ring-2 focus:ring-blue-400`}
              value={step}
              onChange={(e) => editStep(i, e.target.value)}
            />

            <button
              className="rounded px-2 py-1 border focus:ring-2 focus:ring-yellow-400"
              aria-label={`Move step ${i + 1} up`}
              onClick={() => moveStep(i, i - 1)}
            >
              ▲
            </button>

            <button
              className="rounded px-2 py-1 border focus:ring-2 focus:ring-yellow-400"
              aria-label={`Move step ${i + 1} down`}
              onClick={() => moveStep(i, i + 1)}
            >
              ▼
            </button>

            <button
              className="rounded px-3 py-2 bg-red-500 text-white focus:ring-2 focus:ring-red-400"
              aria-label={`Delete step ${i + 1}`}
              onClick={() => removeStep(i)}
            >
              X
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}
