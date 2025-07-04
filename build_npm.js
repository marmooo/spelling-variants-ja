import { build, emptyDir } from "@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.js"],
  outDir: "./npm",
  typeCheck: false,
  compilerOptions: {
    lib: ["ESNext"],
  },
  shims: {
    deno: true,
    custom: [{
      package: { name: "stream/web" },
      globalNames: ["TransformStream"],
    }],
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
