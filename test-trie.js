import { readLines } from "https://deno.land/std/io/mod.ts";
import { sizeof } from "https://deno.land/x/sizeof@v1.0.3/mod.ts";

// trie.set('学校', 'がっこう');
// trie.get('学校');
function Trie() {
  this.root = {};
}

Trie.prototype.set = function (word, yomi) {
  let node = this.root;
  for (let i = 0; i < word.length; i++) {
    if (!node[word[i]]) {
      const newNode = {};
      node[word[i]] = newNode;
      node = newNode;
    } else {
      node = node[word[i]];
    }
  }
  if (node[true]) {
    if (!node[true].includes(yomi)) {
      node[true].push(yomi);
    }
  } else {
    node[true] = [yomi];
  }
};

Trie.prototype.contains = function (word) {
  let node = this.root;
  for (let i = 0; i < word.length; i++) {
    if (node[word[i]]) {
      node = node[word[i]];
    } else {
      return false;
    }
  }
  return node;
};

Trie.prototype.get = function (word) {
  const node = this.root;
  for (const i = 0; i < word.length; i++) {
    if (node[word[i]]) {
      node = node[word[i]];
    } else {
      return undefined;
    }
  }
  return node[true];
};

const trie = new Trie();
let fileReader = await Deno.open("spelling-variants.csv");
for await (const line of readLines(fileReader)) {
  const arr = line.split(",");
  const word = arr[0];
  const yomis = arr.slice(1);
  yomis.forEach((yomi) => trie.set(word, yomi));
}
console.log("trie: " + sizeof(trie.root).bytesize);

const hash = {};
fileReader = await Deno.open("spelling-variants.csv");
for await (const line of readLines(fileReader)) {
  const arr = line.split(",");
  const word = arr[0];
  const yomis = arr.slice(1);
  hash[word] = yomis;
}
console.log("hash: " + sizeof(hash).bytesize);
