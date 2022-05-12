import { Mesh } from "./mesh.js";

Mesh

class Quad extends Mesh {

    onInit() {
        const positions = [
            -0.5, 0.5, 0,
            0.5, 0.5, 0,
            0.5, -0.5, 0,
            -0.5, -0.5, 0
        ];

        const normals = [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ];

        const colors = [
            1, 0, 0, 1,
            0, 1, 0, 1,
            0, 0, 1, 1,
            1, 1, 1, 1
        ];

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