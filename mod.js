import { readLines } from "https://deno.land/std/io/mod.ts";

class SpellingVariantsJa {
  static async fetch(url) {
    const dict = await fetch(url)
      .then((response) => response.text())
      .then((text) => {
        const d = {};
        text.trimEnd().split("\n").forEach((line) => {
          const arr = line.split(",");
          const yomi = arr[0];
          const word = arr[1];
          const surfaces = arr.slice(2);
          if (d[yomi]) {
            d[yomi][word] = surfaces;
          } else {
            d[yomi] = {};
            d[yomi][word] = surfaces;
          }
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
      const yomi = arr[0];
      const word = arr[1];
      const surfaces = arr.slice(2);
      if (dict[yomi]) {
        dict[yomi][word] = surfaces;
      } else {
        dict[yomi] = {};
        dict[yomi][word] = surfaces;
      }
    }
    fileReader.close();
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
