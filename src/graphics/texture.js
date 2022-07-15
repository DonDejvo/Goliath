import { Gol } from "../gol.js";
import { MathUtils } from "../math/math-utils.js";

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

    constructor(data, params = {}) {
        this.data = data;

        this.id = Gol.gl.createTexture();

        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, this.id);
        Gol.gl.texImage2D(Gol.gl.TEXTURE_2D, 0, Gol.gl.RGBA, Gol.gl.RGBA, Gol.gl.UNSIGNED_BYTE, data);

        if(MathUtils.isPowerOf2(data.width) && MathUtils.isPowerOf2(data.height)) {
            Gol.gl.generateMipmap(Gol.gl.TEXTURE_2D);
        }

        Gol.gl.bindTexture(Gol.gl.TEXTURE_2D, null);

        this.setFilter(params.filter || Gol.gl.LINEAR);
        this.setWrap(params.wrap || Gol.gl.CLAMP_TO_EDGE);
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