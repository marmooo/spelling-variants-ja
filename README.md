# spelling-variants-ja

Japanese spelling variants dictionary.

## Build

1. install [SudachiDict](https://github.com/WorksApplications/SudachiDict)
2. install
   [NAIST-jdic](https://ja.osdn.net/projects/naist-jdic/downloads/53500/mecab-naist-jdic-0.6.3b-20111013.tar.gz/)
3. `deno run --allow-read --allow-write build.js`
4. `bash build.sh`

## Usage (Deno)

```
// git clone https://github.com/marmooo/spelling-variants-ja
import { SpellingVariantsJa } from "spelling-variants-ja/mod.js";

const dict = await SpellingVariantsJa.load("spelling-variants-ja/spelling-variants.csv");
dict.get('つく');  // --> [付く, 点く, etc.]
```

## Usage (Node.js)

```
// npm install spelling-variants-ja
const YomiDict = require("spelling-variants-ja");

async function main() {
  const dict = await SpellingVariantsJa.load();
  dict.get('つく');  // --> [付く, 点く, etc.]
}
main();
```

## License

Apache-2.0

## Attribution

- [SudachiDict](https://github.com/WorksApplications/SudachiDict) is licensed
  under the [Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0).
