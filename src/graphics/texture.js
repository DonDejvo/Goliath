import { Gol } from "../gol.js";

class Texture {

    /**
     * 
     * @type {WebGLTexture}
     */
    id;

    /**
     * 
     * @type {TexImageSource}
     */
    data;

    /**
     * 
     * @param {TexImageSource} data 
     */
    constructor(data, params = {}) {
        this.data = data;

        this.id = Gol.gl.createTexture();

        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
        Gol.gl.texImage2D(Gol.gl.TEXTURE_2D, 0, Gol.gl.RGBA, Gol.gl.RGBA, Gol.gl.UNSIGNED_BYTE, data);

        Gol.gl.generateMipmap(Gol.gl.TEXTURE_2D);

        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, null);

        if(params.filter !== undefined) {
            this.setFilter(params.filter)
        }
        if(params.wrap !== undefined) {
            this.setWrap(params.wrap);
        }
    }

    setFilter(filter) {
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
        Gol.gl.texParameteri(Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_MIN_FILTER, filter);
        Gol.gl.texParameteri(Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_MAG_FILTER, filter == Gol.gl.NEAREST ? Gol.gl.NEAREST : Gol.gl.LINEAR);
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, null);
    }

    setWrap(wrap) {
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
        Gol.gl.texParameteri(Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_WRAP_S, wrap);
        Gol.gl.texParameteri(Gol.gl.TEXTURE_2D, Gol.gl.TEXTURE_WRAP_T, wrap);
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, null);
    }

    bind() {
        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
    }

    dispose() {
        Gol.gl.deleteTexture(this.id);
    }

    get width() {
        return this.data.width;
    }

    get height() {
        return this.data.height;
    }
}

export {
    Texture
}