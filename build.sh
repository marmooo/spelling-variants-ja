dir=docs
deno run --allow-read --allow-write web.js
minify --match="\.(js|html)" -r src -o docs
cp -r src/favicon docs
