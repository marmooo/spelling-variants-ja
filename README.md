# spelling-variants-ja

Japanese spelling variants dictionary.

## Build

- install [SudachiDict](https://github.com/WorksApplications/SudachiDict)
- `deno run --allow-read --allow-write build.js`
- `bash build.sh`

## Usage

```
import { SpellingVariantsJa } from "spelling-variants-ja/mod.js";

const dict = await SpellingVariantsJa.load("spelling-variants.csv");
dict.get("あいず");  // --> { "合図": ["合図", "相図"] }
```

## License

Apache-2.0

## Attribution

- [SudachiDict](https://github.com/WorksApplications/SudachiDict) is licensed
  under the [Apache-2.0](http://www.apache.org/licenses/LICENSE-2.0).
