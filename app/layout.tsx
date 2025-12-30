import type { Metadata } from "next";
import "./globals.css";
import { RecipeProvider } from "./RecipeContext";

export const metadata: Metadata = {
  title: "Recipe App",
  description: "Recipe step tracker",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-gray-900">
        <RecipeProvider>{children}</RecipeProvider>
      </body>
    </html>
  );
}