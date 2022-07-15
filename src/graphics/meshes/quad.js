import { Mesh } from "../mesh.js";

class Quad extends Mesh {

    onInit() {

        if(this.options.width === undefined) { 
            this.options.width = 1;
        }
        if(this.options.height === undefined) {
            this.options.height = 1;
        }

        const halfWidth = this.options.width / 2;
        const halfHeight = this.options.height / 2;

        const positions = [
            -halfWidth, halfHeight, 0,
            halfWidth, halfHeight, 0,
            halfWidth, -halfHeight, 0,
            -halfWidth, -halfHeight, 0
        ];

        const normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        const colors = [];

        if(this.options.colors === undefined) {

           for(let i = 0; i < 16; ++i) {
               colors.push(1);
           }

        } else if(this.options.colors.length == 1) {

            const c = this.options.colors[0];

            for(let i = 0; i < 16; ++i) {
                colors.push(c[i % 4]);
            }

        } else if(this.options.colors.length == 4) {
            
            for(let i = 0; i < 4; ++i) {
                const c = this.options.colors[i];
                for(let j = 0; j < 4; ++j) {
                    colors.push(c[j]);
                }
            }

        } else {

            throw new Error("options.colors requires 1 or 4 elements");
        }

        const uvs = [
            0, 0,
            1, 0,
            1, 1,
            0, 1
        ];

        const indices = [
            0, 1, 2,
            0, 2, 3
        ];

        this.bufferData(positions, 3, "positions");
        this.bufferData(normals, 3, "normals");
        this.bufferData(colors, 4, "colors");
        this.bufferData(uvs, 2, "uvs");
        this.bufferData(indices, 0, "index");
    }

}

export {
    Quad
}