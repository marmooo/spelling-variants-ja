const SpellingVariantsJa = require(".");

async function main() {
  const dict = await SpellingVariantsJa.load();
  console.log("つく --> " + dict.get("つく"));
  console.log("まきちらす --> " + dict.get("まきちらす"));
}
main();
