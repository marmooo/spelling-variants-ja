import { TextLineStream } from "@std/streams";

class SpellingVariantsJa {
  static async fetch(url, options) {
    const response = await fetch(url, options);
    const text = await response.text();
    const dict = {};
    text.trimEnd().split("\n").forEach((line) => {
      const arr = line.split(",");
      const yomi = arr[0];
      const word = arr[1];
      const surfaces = arr.slice(2);
      if (d[yomi]) {
        dict[yomi][word] = surfaces;
      } else {
        dict[yomi] = {};
        dict[yomi][word] = surfaces;
      }
    });
    const spellingVariantsJa = new SpellingVariantsJa();
    spellingVariantsJa.dict = dict;
    return spellingVariantsJa;
  }

  static async load(filePath, options) {
    const dict = {};
    const file = await Deno.open(filePath, options);
    const lineStream = file.readable
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream());
    for await (const line of lineStream) {
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
