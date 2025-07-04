import { SpellingVariantsJa } from "./mod.js";
import { assertEquals } from "@std/assert";

Deno.test("Simple check", async () => {
  const dict = await SpellingVariantsJa.load("spelling-variants.csv");
  assertEquals(dict.get("あいけん"), { "愛犬": ["あい犬", "愛犬"] });
});
