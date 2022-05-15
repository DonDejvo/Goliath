import { Mesh } from "../mesh.js";

class Cube extends Mesh {

    onInit() {

        const halfWidth = this.options.width ? this.options.width / 2 : 0.5;
        const halfHeight = this.options.height ? this.options.height / 2 : 0.5;
        const halfDepth = this.options.depth ? this.options.depth / 2 : 0.5;

        const positions = [
            // Front face
            -halfWidth, halfHeight, halfDepth,
            halfWidth, halfHeight, halfDepth,
            halfWidth, -halfHeight, halfDepth,
            -halfWidth, -halfHeight, halfDepth,

            // Back face
            -halfWidth, halfHeight, -halfDepth,
            halfWidth, halfHeight, -halfDepth,
            halfWidth, -halfHeight, -halfDepth,
            -halfWidth, -halfHeight, -halfDepth,

            // Top face
            -halfWidth, halfHeight, -halfDepth,
            halfWidth, halfHeight, -halfDepth,
            halfWidth, halfHeight, halfDepth,
            -halfWidth, halfHeight, halfDepth,

            // Bottom face
            -halfWidth, -halfHeight, halfDepth,
            halfWidth, -halfHeight, halfDepth,
            halfWidth, -halfHeight, -halfDepth,
            -halfWidth, -halfHeight, -halfDepth,

            // Right face
            halfWidth, halfHeight, halfDepth,
            halfWidth, halfHeight, -halfDepth,
            halfWidth, -halfHeight, -halfDepth,
            halfWidth, -halfHeight, halfDepth,

            // Left face
            -halfWidth, halfHeight, -halfDepth,
            -halfWidth, halfHeight, halfDepth,
            -halfWidth, -halfHeight, halfDepth,
            -halfWidth, -halfHeight, -halfDepth,
        ];

        const normals = [
            // Front face
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            // Back face
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,
            0.0, 0.0, -1.0,

            // Top face
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            // Bottom face
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,
            0.0, -1.0, 0.0,

            // Right face
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            // Left face
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
            -1.0, 0.0, 0.0,
        ];

        let textureFaces = "single";
        if(this.options.textureFaces !== undefined) {
            textureFaces = this.options.textureFaces;
        }

        const uvs = [];

        if(textureFaces == "single") {

            for(let i = 0; i < 6; ++i) {
                uvs.push(
                    0, 0,
                    1, 0,
                    1, 1,
                    0, 1
                );
            }

        } else if(textureFaces == "multiple") {

            const w = 0.25, h = 0.5;

            const add = (x, y) => {
                uvs.push(
                    x * w, y * h,
                    w * (x + 1), y * h,
                    w * (x + 1), h * (y + 1),
                    x * w, h * (y + 1)
                );
            }

            // Front face
            add(1, 0);
            // Back face
            add(3, 0);
            // Top face
            add(0, 1);
            // Bottom face
            add(1, 1);
            // Right face
            add(2, 0);
            // Left face
            add(0, 0);

        } else {
            throw new Error("options.textureFaces valid values are single or multiple");
        }

        const indices = [
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ];


        const faceColors = [];

        if(this.options.colors === undefined) {

            for(let i = 0; i < 24; ++i) {
                faceColors.push(1);
            }
 
         } else if(this.options.colors.length == 1) {
 
             const c = this.options.colors[0];
 
             for(let i = 0; i < 24; ++i) {
                 faceColors.push(c[i % 4]);
             }
 
         } else if(this.options.colors.length == 6) {
             
             for(let i = 0; i < 6; ++i) {
                 const c = this.options.colors[i];
                 for(let j = 0; j < 4; ++j) {
                     faceColors.push(c[j]);
                 }
             }
 
         } else {
 
             throw new Error("options.colors requires 1 or 6 elements");
         }

        const colors = [];
        for (let i = 0; i < 6; ++i) {
            for (let j = 0; j < 4; ++j) {
                for (let k = 0; k < 4; ++k) {
                    colors.push(faceColors[i * 4 + k]);
                }
            }
        }

        this.bufferData(positions, 3, "positions");
        this.bufferData(normals, 3, "normals");
        this.bufferData(colors, 4, "colors");
        this.bufferData(uvs, 2, "uvs");
        this.bufferData(indices, 0, "index");
    }

}

export {
    Cube
}