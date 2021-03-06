import { Mesh } from "../mesh.js";


class Plane extends Mesh {

    onInit() {

        if(this.options.width === undefined) { 
            this.options.width = 1;
        }
        if(this.options.depth === undefined) {
            this.options.depth = 1;
        }

        const halfWidth = this.options.width / 2;
        const halfDepth = this.options.depth / 2;

        const widthSegments = this.options.widthSegments || 1;
        const depthSegments = this.options.depthSegments  || 1;
        const heightMap = this.options.heightMap  || Plane.generateHeightMap(widthSegments, depthSegments);

        const positions = [];
        const normals = [];
        const uvs = [];
        const colors = [];
        const indices = [];

        for (let i = 0; i < depthSegments; ++i) {
            for (let j = 0; j < widthSegments; ++j) {

                positions.push(
                    (2 * j / widthSegments - 1) * halfWidth, heightMap[i][j], (2 * i / depthSegments - 1) * halfDepth,
                    (2 * (j + 1) / widthSegments - 1) * halfWidth, heightMap[i][j + 1], (2 * i / depthSegments - 1) * halfDepth,
                    (2 * (j + 1) / widthSegments - 1) * halfWidth, heightMap[i + 1][j + 1], (2 * (i + 1) / depthSegments - 1) * halfDepth,
                    (2 * j / widthSegments - 1) * halfWidth, heightMap[i + 1][j], (2 * (i + 1) / depthSegments - 1) * halfDepth
                );

                normals.push(
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0,
                    0, 1, 0
                );

                if (this.options.textureRepeat === undefined || this.options.textureRepeat === false) {
                    uvs.push(
                        j / widthSegments, i / depthSegments,
                        (j + 1) / widthSegments, i / depthSegments,
                        (j + 1) / widthSegments, (i + 1) / depthSegments,
                        j / widthSegments, (i + 1) / depthSegments
                    );
                } else {
                    uvs.push(
                        0, 0,
                        1, 0,
                        1, 1,
                        0, 1
                    );
                }

                const indexOffset = (i * widthSegments + j) * 4;
                indices.push(
                    indexOffset, indexOffset + 1, indexOffset + 2,
                    indexOffset, indexOffset + 2, indexOffset + 3
                );

            }
        }

        if (this.options.colors === undefined) {

            for (let i = 0; i < widthSegments * depthSegments * 16; ++i) {
                colors.push(1);
            }

        } else if (typeof this.options.colors == "function") {
            const func = this.options.colors;

            const colorCache = [];
            for(let i = 0; i <= depthSegments; ++i) {
                colorCache.push([]);
                for(let j = 0; j <= widthSegments; ++j) {
                    const c = func(j / widthSegments * halfWidth * 2 - halfWidth, heightMap[i][j], i / depthSegments * halfDepth * 2 - halfDepth);
                    colorCache[i].push(c);
                }
            }

            for (let i = 0; i < depthSegments; ++i) {
                for (let j = 0; j < widthSegments; ++j) {
                    colors.push(
                        ...colorCache[i][j],
                        ...colorCache[i][j + 1],
                        ...colorCache[i + 1][j + 1],
                        ...colorCache[i + 1][j],
                    );
                }
            }

        } else if (this.options.colors.length == 1) {

            const c = this.options.colors[0];

            for (let i = 0; i < widthSegments * depthSegments * 16; ++i) {
                colors.push(c[i % 4]);
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

    static generateHeightMap(widthSegments, depthSegments) {
        return [...new Array(depthSegments + 1)].map(e => [...new Array(widthSegments + 1)].fill(0));
    }

}

export {
    Plane
}