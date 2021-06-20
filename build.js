import { readLines } from "https://deno.land/std/io/mod.ts";

const outPath = "spelling-variants.csv";
const dicts = {
  // JmDict: ['JmdictFurigana.txt'],
  // IPADic: [  // require iconv
  //   'ipadic-2.7.0/Adverb.utf8.dic',
  //   'ipadic-2.7.0/Adnominal.utf8.dic',
  //   'ipadic-2.7.0/Noun.adjv.utf8.dic',
  //   'ipadic-2.7.0/Noun.adverbal.utf8.dic',
  //   'ipadic-2.7.0/Noun.verbal.utf8.dic',
  //   'ipadic-2.7.0/Verb.utf8.dic',
  // ],
  NaistJdic: [ // require iconv
    "mecab-naist-jdic-0.6.3b-20111013/naist-jdic.utf8.csv",
  ],
  // UniDic: ['unidic-csj-3.0.1.1/lex.csv'],
  SudachiDict: [
    "SudachiDict/src/main/text/small_lex.csv",
    "SudachiDict/src/main/text/core_lex.csv",
  ],
};

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function getWordFromJmDict(line) {
  const [word, yomi] = line.split("|", 2);
  return [word, yomi];
}

function getWordFromIPADic(line) {
  const p11 = line.indexOf("見出し語 (") + 6;
  const p12 = line.slice(p11).indexOf(")");
  const [word, _cost] = line.slice(p11, p11 + p12).split(" ");
  const p21 = line.indexOf("(読み ") + 4;
  const p22 = line.slice(p21).indexOf(")");
  const yomi = line.slice(p21, p21 + p22).split(" ")[0];
  return [word, yomi];
}

function getWordFromNaistJdic(line) {
  const arr = line.split(",");
  const pos1 = arr[4];
  const pos2 = arr[5];
  const form2 = arr[9];
  if (pos2 == "固有名詞") {
    return false;
  }
  if (pos1 != "名詞" && form2 != "基本形") {
    return false;
  }
  const word = arr[0];
  const yomi = arr[11];
  const variants = arr[13];
  if (variants == "") {
    return false;
  }
  return [word, yomi, pos1];
}

function getWordFromUniDic(line) {
  line = line.replace(/"[^"]+"/g, "");
  const arr = line.split(",");
  const pos1 = arr[4];
  const pos2 = arr[5];
  const form2 = arr[9];
  if (pos2 == "固有名詞") {
    return false;
  }
  if (pos1 != "名詞" && form2 != "終止形-一般") {
    return false;
  }
  let word = arr[0];
  if (word.includes("（") && word.includes("）")) {
    const tmp = word.split(/[（）]/);
    word = tmp.slice(1).join("");
  }
  let yomi = arr[24];
  if (yomi == "*") {
    yomi = arr[10];
  }
  return [word, yomi, pos1];
}

function getWordFromSudachiDict(line) {
  const arr = line.split(",");
  const word = arr[0];
  const surface = arr[12];
  if (surface == word) {
    return false; // 同音異義語は排除
  }
  const pos1 = arr[5];
  const pos2 = arr[6];
  const form2 = arr[10];
  if (pos2 == "固有名詞") {
    return false;
  }
  if (pos1 != "名詞" && form2 != "終止形-一般") {
    return false;
  }
  const yomi = arr[11];
  return [word, yomi, pos1];
}

async function addDictData(dictName, path) {
  const fileReader = await Deno.open(path);
  for await (const line of readLines(fileReader)) {
    if (!line) continue;
    let data;
    switch (dictName) {
      case "IPADic":
        data = getWordFromIPADic(line);
        break;
      case "JmDict":
        data = getWordFromJmDict(line);
        break;
      case "NaistJdic":
        data = getWordFromNaistJdic(line);
        break;
      case "UniDic":
        data = getWordFromUniDic(line);
        break;
      case "SudachiDict":
        data = getWordFromSudachiDict(line);
        break;
      default:
        console.log("dictName error.");
    }
    if (data && data[0] && data[1]) {
      let [word, yomi, pos1] = data;
      yomi = kanaToHira(yomi);
      word = kanaToHira(word);
      // 名詞は漢字のみの熟語、名詞以外は漢字を含む熟語に限定
      let kanjiCount = 0;
      let hiraCount = 0;
      for (let i = 0; i < word.length; i++) {
        const chr = word[i];
        if (/[\u4E00-\u9FFF]/.test(chr)) {
          kanjiCount += 1;
        } else if (/[ぁ-ん]/.test(chr)) {
          hiraCount += 1;
        }
      }
      if (
        (pos1 == "名詞" && hiraCount == 0 && kanjiCount == word.length) ||
        (pos1 != "名詞" && hiraCount > 0 && kanjiCount > 0)
      ) {
        const words = d[yomi];
        if (words) {
          if (!d[yomi].includes(word)) {
            d[yomi].push(word);
          }
        } else {
          d[yomi] = [word];
        }
      }
    }
  }
}

const d = {};
for (const [dictName, paths] of Object.entries(dicts)) {
  for (const path of paths) {
    await addDictData(dictName, path);
  }
}
for (const [yomi, words] of Object.entries(d)) {
  if (words.length < 2) {
    delete d[yomi];
  }
}
const arr = Object.entries(d).map(([k, v]) => [k, v]);
arr.sort(function (a, b) {
  if (a[0] < b[0]) return -1;
  if (a[0] > b[0]) return 1;
  return 0;
});

let result = "";
for (const [yomi, words] of arr) {
  result += yomi + "," + words.join(",") + "\n";
}
Deno.writeTextFileSync(outPath, result);
