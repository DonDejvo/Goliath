import { Gol } from "../gol.js";
import { Shader } from "./shader.js";


class Mesh {

    /**
     * 
     * @type { { name: string, size: number, data: number[], buffer: WebGLBuffer }[] }
     */
    buffers = [];

    /**
     * 
     * @type {number}
     */
    vertexCount = 0;

    constructor() {
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
        this.buffers.push({
            name,
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

        for(let info of this.buffers) {

            const loc = shader.shaderData.attribs[info.name];

            if(loc != -1) {
                if (info.name == "index") {
                    Gol.gl.bindBuffer(Gol.gl.ELEMENT_ARRAY_BUFFER, info.buffer);
                } else {
                    Gol.gl.bindBuffer(Gol.gl.ARRAY_BUFFER, info.buffer);
                    Gol.gl.vertexAttribPointer(loc, info.size, Gol.gl.FLOAT, false, 0, 0);
                    Gol.gl.enableVertexAttribArray(loc);
                }
            }
        }
    }

    draw() {
        Gol.gl.drawElements(Gol.gl.TRIANGLES, this.vertexCount, Gol.gl.UNSIGNED_SHORT, 0);
    }

}

export {
    Mesh
}