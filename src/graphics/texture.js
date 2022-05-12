import { Gol } from "../gol.js";

class Texture {

    /**
     * 
     * @type {number}
     */
    id;

    constructor(image) {
        this.id = Gol.gl.createTexture();
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
        Gol.gl.texImage2D(Gol.gl.TEXTURE_2D, 0, Gol.gl.RGBA, Gol.gl.RGBA, Gol.gl.UNSIGNED_BYTE, image);
        Gol.gl.generateMipmap(Gol.gl.TEXTURE_2D);
        Gol.gl.texParameteri(Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_MIN_FILTER, Gol.gl.LINEAR_MIPMAP_LINEAR);
        Gol.gl.texParameteri(Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_MAG_FILTER, Gol.gl.LINEAR);
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, null);
    }

    bind() {
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
    }
}

export {
    Texture
}