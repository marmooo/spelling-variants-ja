const fs = require("fs");
const readline = require("readline");

class SpellingVariantsJa {
  static async load(filepath) {
    const dict = {};
    if (!filepath) {
      filepath = __dirname + "/spelling-variants.csv";
    }
    const fileReader = fs.createReadStream(filepath);
    const rl = readline.createInterface({ input: fileReader });
    for await (const line of rl) {
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

module.exports = SpellingVariantsJa;
