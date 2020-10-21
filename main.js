const fs = require('fs');
const readEachLineSync = require('read-each-line-sync')

function SpellingVariantsJa() {
  var dict = {};
  readEachLineSync(__dirname + '/spelling-variants.csv', 'utf8', (line) => {
    var arr = line.split(',');
    var yomi = arr[0];
    var words = arr.slice(1);
    dict[yomi] = words;
  });
  this.dict = dict;
}

SpellingVariantsJa.prototype.get = function(word) {
  return this.dict[word];
};

module.exports = SpellingVariantsJa;

