import * as path from "https://deno.land/std/path/mod.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";

class SpellingVariantsJa {
  static async load() {
    const dict = {};
    const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
    const fileReader = await Deno.open(__dirname + "/spelling-variants.csv");
    for await (const line of readLines(fileReader)) {
      const arr = line.split(",");
      const word = arr[0];
      const yomis = arr.slice(1);
      dict[word] = yomis;
    }
    const spellingVariantsJa = new SpellingVariantsJa();
    spellingVariantsJa.dict = dict;
    return spellingVariantsJa;
  }

  constructor() {
    this.dict = {};
  }

  get(word) {
    return this.dict[word];
  }
}

export { SpellingVariantsJa };
