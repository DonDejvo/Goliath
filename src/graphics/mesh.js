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
    vertexCount = 0;

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

    bufferData(data, size, name) {
        const buffer = Gol.gl.createBuffer();
        if(name == "index") {
            Gol.gl.bindBuffer(Gol.gl.ELEMENT_ARRAY_BUFFER, buffer);
            Gol.gl.bufferData(Gol.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), Gol.gl.STATIC_DRAW);
            this.vertexCount = data.length;
        } else {
            Gol.gl.bindBuffer(Gol.gl.ARRAY_BUFFER, buffer);
            Gol.gl.bufferData(Gol.gl.ARRAY_BUFFER, new Float32Array(data), Gol.gl.STATIC_DRAW);
        }

        if(this.buffers.has(name)) {
            Gol.gl.deleteBuffer(this.buffers.get(name).buffer);
        }

        this.buffers.set(name, {
            size,
            data,
            buffer
        });
    }

    /**
     * 
     * @param {Shader} shader 
     */
    bind(shader) {

        this.buffers.forEach((info, name) => {

            const loc = shader.shaderData.attribs[name];

            if(loc != -1) {
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
        Gol.gl.drawElements(Gol.gl.TRIANGLES, this.vertexCount, Gol.gl.UNSIGNED_SHORT, 0);
    }

}

export {
    Mesh
}