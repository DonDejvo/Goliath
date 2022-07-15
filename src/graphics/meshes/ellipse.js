import { Mesh } from "../mesh.js";

class Ellipse extends Mesh {

    onInit() {

        if(this.options.width === undefined) { 
            this.options.width = 1;
        }
        if(this.options.height === undefined) {
            this.options.height = 1;
        }
        const segments = this.options.segments || 32;

        const halfWidth = this.options.width / 2;
        const halfHeight = this.options.height / 2;

        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];

        for(let i = 0; i <= segments; ++i) {
            const angle1 = i / segments * 2 * Math.PI;
            const sin1 = Math.sin(angle1);
            const cos1 = Math.cos(angle1);

            positions.push(cos1 * halfWidth, sin1 * halfHeight, 0);
            normals.push(0, 0, 1);
            uvs.push((cos1 + 1) * 0.5, (sin1 + 1) * 0.5);
            if(i != 0 && i != segments) {
                indices.push(
                    0, i, i + 1
                );
            }
        }

        const colors = [];

        if(this.options.colors === undefined) {

           for(let i = 0; i <= segments; ++i) {
               colors.push(1, 1, 1, 1);
           }

        } else if(this.options.colors.length == 1) {

            const c = this.options.colors[0];

            for(let i = 0; i <= segments; ++i) {
                colors.push(...c);
            }

        } else {

            throw new Error("options.colors requires 1 elements");
        }

        this.bufferData(positions, 3, "positions");
        this.bufferData(normals, 3, "normals");
        this.bufferData(colors, 4, "colors");
        this.bufferData(uvs, 2, "uvs");
        this.bufferData(indices, 0, "index");
    }

}

export {
    Ellipse
}