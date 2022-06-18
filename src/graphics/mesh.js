import { Gol } from "../gol.js";
import { Shader } from "./shader.js";


class Mesh {

    /**
     * 
     * @type { Map<string, { size: number, data: number[], buffer: WebGLBuffer }> }
     */
    buffers = new Map();

    /**
     * 
     * @type {number}
     */
     indexCount = 0;

    /**
     * 
     * @type {Object}
     */
    options;

    constructor(opts = {}) {

        this.options = opts;

        this.onInit();
    }

    onInit() {}

    createBuffer(name, size) {
        const info = {
            size,
            data: [],
            buffer: null
        };
        this.buffers.set(name, info);
        return info;
    }

    getBuffer(name) {
        return this.buffers.get(name);
    }

    bufferData(data, size, name) {

        this.buffers.set(name, {
            size,
            data,
            buffer: null
        });
    }

    initBuffer(name) {
        const info = this.buffers.get(name);
        if(info.buffer == null) {
            info.buffer = Gol.gl.createBuffer();
        }
        if(name == "index") {
            Gol.gl.bindBuffer(Gol.gl.ELEMENT_ARRAY_BUFFER, info.buffer);
            Gol.gl.bufferData(Gol.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(info.data), Gol.gl.STATIC_DRAW);
            this.indexCount = info.data.length;
        } else {
            Gol.gl.bindBuffer(Gol.gl.ARRAY_BUFFER, info.buffer);
            Gol.gl.bufferData(Gol.gl.ARRAY_BUFFER, new Float32Array(info.data), Gol.gl.STATIC_DRAW);
        }
    }

    /**
     * 
     * @param {Shader} shader 
     */
    bind(shader) {

        this.buffers.forEach((info, name) => {

            const loc = shader.shaderData.attribs[name];

            if(loc != -1) {
                if(info.buffer == null) {
                    this.initBuffer(name);
                }

                if (name == "index") {
                    Gol.gl.bindBuffer(Gol.gl.ELEMENT_ARRAY_BUFFER, info.buffer);
                } else {
                    Gol.gl.bindBuffer(Gol.gl.ARRAY_BUFFER, info.buffer);
                    Gol.gl.vertexAttribPointer(loc, info.size, Gol.gl.FLOAT, false, 0, 0);
                    Gol.gl.enableVertexAttribArray(loc);
                }
            }
        });
    }

    draw() {
        Gol.gl.drawElements(Gol.gl.TRIANGLES, this.indexCount, Gol.gl.UNSIGNED_SHORT, 0);
    }

    unbind(shader) {
        this.buffers.forEach((info, name) => {

            const loc = shader.shaderData.attribs[name];

            if(loc != -1) {
                if (name != "index") {
                    Gol.gl.disableVertexAttribArray(loc);
                }
            }
        });
    }

}

export {
    Mesh
}