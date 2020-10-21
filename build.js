const fs = require('fs');
const readEachLineSync = require('read-each-line-sync')

const outPath = __dirname + '/spelling-variants.csv';
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
  NaistJdic: [  // require iconv
    'mecab-naist-jdic-0.6.3b-20111013/naist-jdic.utf8.csv'
  ],
  // UniDic: ['unidic-csj-3.0.1.1/lex.csv'],
  SudachiDict: [
    'SudachiDict/src/main/text/small_lex.csv',
    'SudachiDict/src/main/text/core_lex.csv',
  ],
};

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function(match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

function getWordFromJmDict(line) {
  var [word, yomi] = line.split('|', 2);
  return [word, yomi];
}

function getWordFromIPADic(line) {
  var p11 = line.indexOf('見出し語 (') + 6;
  var p12 = line.slice(p11).indexOf(')');
  var [word, cost] = line.slice(p11, p11+p12).split(' ');
  var p21 = line.indexOf('(読み ') + 4;
  var p22 = line.slice(p21).indexOf(')');
  var yomi = line.slice(p21, p21+p22).split(' ')[0];
  return [word, yomi];
}

function getWordFromNaistJdic(line) {
  var arr = line.split(',');
  var pos1 = arr[4];
  var pos2 = arr[5];
  var form2 = arr[9];
  if (pos2 == '固有名詞') {
    return false;
  }
  if (pos1 != '名詞' && form2 != '基本形') {
    return false;
  }
  var word = arr[0];
  var yomi = arr[11];
  var variants = arr[13];
  if (variants == '') {
    return false;
  }
  return [word, yomi, pos1];
}

function getWordFromUniDic(line) {
  var line = line.replace(/"[^"]+"/g, '');
  var arr = line.split(',');
  var pos1 = arr[4];
  var pos2 = arr[5];
  var form2 = arr[9];
  if (pos2 == '固有名詞') {
    return false;
  }
  if (pos1 != '名詞' && form2 != '終止形-一般') {
    return false;
  }
  var word = arr[0];
  if (word.includes('（') && word.includes('）')) {
    var tmp = word.split(/[（）]/);
    word = tmp.slice(1).join('');
  }
  var yomi = arr[24];
  if (yomi == '*') {
    yomi = arr[10];
  }
  return [word, yomi, pos1];
}

function getWordFromSudachiDict(line) {
  var arr = line.split(',');
  var word = arr[0];
  var surface = arr[12];
  if (surface == word) {
    return false;  // 同音異義語は排除
  }
  var pos1 = arr[5];
  var pos2 = arr[6];
  var form2 = arr[10];
  if (pos2 == '固有名詞') {
    return false;
  }
  if (pos1 != '名詞' && form2 != '終止形-一般') {
    return false;
  }
  var yomi = arr[11];
  return [word, yomi, pos1];
}


var d = {};
for (var [dictName, paths] of Object.entries(dicts)) {
  paths.forEach(path => {
    readEachLineSync(path, 'utf8', (line) => {
      var data;
      switch(dictName) {
        case 'IPADic':      data = getWordFromIPADic(line);  break;
        case 'JmDict':      data = getWordFromJmDict(line);  break;
        case 'NaistJdic':   data = getWordFromNaistJdic(line);  break;
        case 'UniDic':      data = getWordFromUniDic(line);  break;
        case 'SudachiDict': data = getWordFromSudachiDict(line);  break;
        default: console.log('dictName error.');
      }
      if (data && data[0] && data[1]) {
        var [word, yomi, pos1] = data;
        yomi = kanaToHira(yomi);
        word = kanaToHira(word);
        // 名詞は漢字のみの熟語、名詞以外は漢字を含む熟語に限定
        var kanjiCount = 0;
        var hiraCount = 0;
        for (var i=0; i<word.length; i++) {
          var chr = word[i];
          if (/[\u4E00-\u9FFF]/.test(chr)) {
            kanjiCount += 1;
          } else if (/[ぁ-ん]/.test(chr)) {
            hiraCount += 1;
          }
        }
        if ((pos1 == '名詞' && hiraCount == 0 && kanjiCount == word.length) ||
            (pos1 != '名詞' && hiraCount  > 0 && kanjiCount > 0)) {
          var words = d[yomi];
          if (words) {
            if (!d[yomi].includes(word)) {
              d[yomi].push(word);
            }
          } else {
            d[yomi] = [word];
          }
        }
      }
    });
  });
}
for (var [yomi, words] of Object.entries(d)) {
  if (words.length < 2) {
    delete d[yomi];
  }
}
var arr = Object.entries(d).map(([k,v]) => [k,v]);
arr.sort(function(a,b){
  if(a[0] < b[0]) return -1;
  if(a[0] > b[0]) return 1;
  return 0;
});

if (fs.existsSync(outPath)) {
  fs.unlinkSync(outPath);
}
arr.forEach(e => {
  var [yomi, words] = e;
  fs.appendFileSync(outPath, yomi + ',' + words.join(',') + '\n');
});

