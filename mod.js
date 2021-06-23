import { readLines } from "https://deno.land/std/io/mod.ts";

class SpellingVariantsJa {
  static async fetch(url) {
    const dict = await fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const d = {};
        text.split("\n").forEach((line) => {
          if (!line) return;
          const arr = line.split(",");
          const word = arr[0];
          const yomis = arr.slice(1);
          d[word] = yomis;
        });
        return d;
      }).catch((e) => {
        console.log(e);
      });
    const spellingVariantsJa = new SpellingVariantsJa();
    spellingVariantsJa.dict = dict;
    return spellingVariantsJa;
  }

  static async load(filepath) {
    const dict = {};
    if (!filepath) {
      filepath = "./spelling-variants-ja/spelling-variants.csv";
    }
    const fileReader = await Deno.open(filepath);
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
