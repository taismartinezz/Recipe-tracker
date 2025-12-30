export async function fetchGraphQL<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const res = await fetch("http://localhost:4000/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.errors?.length) {
      throw new Error(json.errors[0]?.message || "GraphQL error");
    }
    return json.data as T;
  }
  