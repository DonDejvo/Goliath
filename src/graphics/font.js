import { Gol } from "../gol.js";
import { Texture } from "./texture.js";

class Font {

    /**
     * 
     * @type {Object}
     */
    options;

    /**
     * 
     */
    columns = 10;

    /**
     * 
     */
    charFrom = 32;

    /**
     * 
     */
    charTo = 126;

    /**
     * 
     * @type {HTMLCanvasElement}
     */
    bitmap;

    /**
     * 
     * @type {Texture}
     */
    texture;

    charWidth;

    charHeight;

    constructor(opts) {
        this.options = opts;

        this.charWidth = opts.fontSize * opts.charRatio;
        this.charHeight = opts.fontSize * 1.2;
        
        this.bitmap = this.generateBitmap();
        this.texture = new Texture(this.bitmap, {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });
    }

    generateBitmap() {
        const bitmap = document.createElement("canvas");

        const charCount = this.charTo - this.charFrom + 1;
        const rows = Math.floor(charCount / this.columns);
        
        bitmap.width = 2 ** Math.ceil(Math.log2(this.columns * this.charWidth));
        bitmap.height = 2 ** Math.ceil(Math.log2(rows * this.charHeight));

        const ctx = bitmap.getContext("2d");

        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;

        for(let i = 0; i < charCount; ++i) {
            const char = String.fromCharCode(i + this.charFrom);
            
            const x = (i % this.columns + 0.5) * this.charWidth;
            const y = (Math.floor(i / this.columns) + 0.5) * this.charHeight;
        
            ctx.fillText(char, x, y);
        }

        return bitmap;
    }

    getCharPosition(char) {
        if(char < this.charFrom || char > this.charTo) {
            return null;
        } 

        const idx = char - this.charFrom;

        return [
            (idx % this.columns) * this.charWidth,
            Math.floor(idx / this.columns) * this.charHeight
        ];
    }

}

export {
    Font
}