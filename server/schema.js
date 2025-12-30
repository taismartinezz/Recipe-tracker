import { readAll, writeAll, uid } from "./db.js";

export const typeDefs = /* GraphQL */ `
  type Recipe {
    id: ID!
    title: String!
    steps: [String!]!
    image: String
    done: [Boolean!]
  }

  type Query {
    recipes: [Recipe!]!
    recipe(id: ID!): Recipe
  }

  input RecipeInput {
    title: String!
    steps: [String!]
    image: String
    done: [Boolean!]
  }

  input RecipePatch {
    title: String
    steps: [String!]
    image: String
    done: [Boolean!]
  }

  type Mutation {
    createRecipe(input: RecipeInput!): Recipe!
    updateRecipe(id: ID!, patch: RecipePatch!): Recipe
    deleteRecipe(id: ID!): Boolean!
  }
`;

export const resolvers = {
  Query: {
    recipes: async () => readAll(),
    recipe: async (_, { id }) => {
      const list = await readAll();
      return list.find((r) => r.id === id) || null;
    }
  },
  Mutation: {
    createRecipe: async (_, { input }) => {
      const list = await readAll();
      const recipe = {
        id: uid(),
        title: input.title,
        steps: input.steps ?? [],
        image: input.image ?? null,
        done: input.done ?? []
      };
      list.push(recipe);
      await writeAll(list);
      return recipe;
    },
    updateRecipe: async (_, { id, patch }) => {
      const list = await readAll();
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      const current = list[idx];
      const updated = {
        ...current,
        ...(patch.title !== undefined ? { title: patch.title } : {}),
        ...(patch.steps !== undefined ? { steps: patch.steps } : {}),
        ...(patch.image !== undefined ? { image: patch.image } : {}),
        ...(patch.done !== undefined ? { done: patch.done } : {})
      };
      list[idx] = updated;
      await writeAll(list);
      return updated;
    },
    deleteRecipe: async (_, { id }) => {
      const list = await readAll();
      const next = list.filter((r) => r.id !== id);
      const changed = next.length !== list.length;
      if (changed) await writeAll(next);
      return changed;
    }
  }
};
