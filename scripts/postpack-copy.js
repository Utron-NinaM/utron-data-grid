const fs = require("fs");
const path = require("path");

const DEST_DIR = "C:\\Dev-Trunk\\Libraries\\Internal\\UtronDataGrid";

const pkg = require("../package.json");
const slug = pkg.name.replace(/^@/, "").replace(/\//g, "-");
const tgz = `${slug}-${pkg.version}.tgz`;
const src = path.join(__dirname, "..", tgz);

if (!fs.existsSync(src)) {
  console.error("postpack-copy: tarball not found:", src);
  process.exit(1);
}

if (!fs.existsSync(DEST_DIR)) {
  console.error("postpack-copy: destination directory does not exist:", DEST_DIR);
  process.exit(1);
}
if (!fs.statSync(DEST_DIR).isDirectory()) {
  console.error("postpack-copy: destination is not a directory:", DEST_DIR);
  process.exit(1);
}

const dest = path.join(DEST_DIR, tgz);
fs.copyFileSync(src, dest);
console.log("postpack-copy:", dest);
