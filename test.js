import { SpellingVariantsJa } from "./mod.js";

let dict = await SpellingVariantsJa.load("spelling-variants.csv");
console.log("つく --> " + dict.get("つく"));
console.log("まきちらす --> " + dict.get("まきちらす"));

dict = await SpellingVariantsJa.fetch(
  "https://raw.githubusercontent.com/marmooo/spelling-variants-ja/main/spelling-variants.csv",
);
console.log("つく --> " + dict.get("つく"));
console.log("まきちらす --> " + dict.get("まきちらす"));
