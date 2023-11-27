import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.js"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "spelling-variants-ja",
    version: "0.1.4",
    description: "Japanese spelling variants dictionary.",
    license: "Apache-2.0",
    main: "mod.js",
    repository: {
      type: "git",
      url: "git+https://github.com/marmooo/spelling-variants-ja.git",
    },
    bugs: {
      url: "https://github.com/marmooo/spelling-variants-ja/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");
    Deno.copyFileSync("spelling-variants.csv", "npm/esm/spelling-variants.csv");
    Deno.copyFileSync(
      "spelling-variants.csv",
      "npm/script/spelling-variants.csv",
    );
  },
});
