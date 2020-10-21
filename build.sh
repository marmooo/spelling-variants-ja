dir=docs
node web.js
minify --match="\.(js|html)" -r src -o docs
cp -r src/favicon docs
