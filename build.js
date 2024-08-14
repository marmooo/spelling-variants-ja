import { TextLineStream } from "jsr:@std/streams/text-line-stream";
import { Eta } from "https://deno.land/x/eta@v3.4.0/src/index.ts";
import { JKAT, Kanji } from "npm:@marmooo/kanji@0.0.8";

const dirNames = [
  "小1",
  "小2",
  "小3",
  "小4",
  "小5",
  "小6",
  "中2",
  "中3",
  "高校",
  "常用",
  "準1級",
  "1級",
];
const gradeNames = [
  "小学1年生",
  "小学2年生",
  "小学3年生",
  "小学4年生",
  "小学5年生",
  "小学6年生",
  "中学1〜2年生",
  "中学3年生",
  "高校生",
  "常用漢字",
  "漢検準1級",
  "漢検1級",
];
const akasataNames = [
  "あ〜お",
  "か〜こ",
  "さ〜そ",
  "た〜と",
  "な〜の",
  "は〜ほ",
  "ま〜も",
  "や〜よ",
  "ら〜り",
  "わ〜ん",
];

function toNav(grade, akasataNames) {
  let html =
    '\n<ul class="d-flex flex-wrap justify-content-center list-unstyled">\n';
  for (let i = 0; i < akasataNames.length; i++) {
    const url = "/spelling-variants-ja/" + dirNames[grade] + "/" +
      akasataNames[i] + "/";
    html += '<li class="px-1"><a href="' + url + '">' + akasataNames[i] +
      "</a></li>\n";
  }
  html += "</ul>\n";
  return html;
}

function toSection(mode, variants) {
  let html = "\n";
  let count = 0;
  variants.forEach((variant) => {
    const [yomi, word, surfaces] = variant;
    const def = toDef(yomi, word, surfaces);
    if (def.length != 0) {
      html += def;
      count += 1;
    }
  });
  if (count == 0) {
    html += "<p>この年次に習う" + mode + "はありません。</p>";
  }
  return html;
}

function toDef(yomi, word, surfaces) {
  let html = '\n<dl class="d-flex flex-wrap m-0 notranslate">';
  html += `<dt class="px-1">${yomi} (${word})</dt>`;
  surfaces.forEach((surface) => {
    html += '<dd class="px-1 m-0">' + toLink(surface) + "</dd>";
  });
  html += "</dl>\n";
  return html;
}

function toLink(word) {
  let html = "\n";
  const url = "https://www.google.com/search?q=" + word + "とは";
  html += '<a href="' + url + '" target="_blank" rel="noopener noreferer">' +
    word + "</a>\n";
  return html;
}

function selected(grade, index) {
  if (grade == index) {
    return "selected";
  } else {
    return "";
  }
}

const jkat = new Kanji(JKAT);
const variants = [];
const file = await Deno.open("spelling-variants.csv");
const lineStream = file.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());
for await (const line of lineStream) {
  if (!line) continue;
  const arr = line.split(",");
  const yomi = arr[0];
  const word = arr[1];
  const surfaces = arr.slice(2);
  variants.push([yomi, word, surfaces]);
}

const akasatana = "あかさたなはまやらわ";
const index = new Array(11);
let pos = 0;
index[0] = 0;
index[10] = variants.length - 1;
for (let i = 1; i < akasatana.length; i++) {
  for (let j = pos; j < variants.length; j++) {
    if (variants[j][0][0] == akasatana[i]) {
      index[i] = j;
      pos = j + 1;
      break;
    }
  }
}

const data = new Array(JKAT.length);
for (let i = 0; i < data.length; i++) {
  data[i] = new Array(10);
  for (let j = 0; j < data[i].length; j++) {
    data[i][j] = [];
  }
}
for (let i = 0; i < index.length - 1; i++) {
  for (let j = index[i]; j < index[i + 1]; j++) {
    const yomi = variants[j][0];
    const word = variants[j][1];
    const surfaces = variants[j][2];
    for (let g = 0; g < JKAT.length; g++) {
      const candidates = [];
      surfaces.forEach((surface) => {
        if (jkat.getGrade(surface) <= g) {
          candidates.push(surface);
        }
      });
      if (candidates.length > 1) {
        data[g][i].push([yomi, word, candidates]);
      }
    }
  }
}

const eta = new Eta({ views: ".", cache: true });
const allVariants = Deno.readTextFileSync("spelling-variants.csv");
const num = allVariants.trimEnd().split("\n").length;
for (let g = 0; g < JKAT.length; g++) {
  const dir = "src/" + dirNames[g];
  Deno.mkdirSync(dir, { recursive: true });
  for (let i = 0; i < akasataNames.length; i++) {
    const akasataDir = dir + "/" + akasataNames[i];
    Deno.mkdirSync(akasataDir, { recursive: true });
    const html = eta.render("page.eta", {
      num: num.toLocaleString("ja-JP"),
      grade: g,
      gradeName: gradeNames[g],
      variants: data[g][i],
      akasataName: akasataNames[i],
      gradeNames: gradeNames,
      akasataNames: akasataNames,
      dirNames: dirNames,
      toNav: toNav,
      toSection: toSection,
      selected: selected,
    });
    Deno.writeTextFileSync(akasataDir + "/index.html", html);
  }
}
