const esbuild = require("esbuild")

esbuild.build({
    entryPoints: ["src/gol.js"],
    bundle: true,
    sourcemap: true,
    minify: true,
    format: "esm",
    outfile: "dist/goliath.js"
})
