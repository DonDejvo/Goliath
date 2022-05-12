const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/gol.js"],
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "esm",
    outfile: "dist/goliath.js"
})
.then(() => console.log("build was successful"))
.catch(() => process.exit(1));
