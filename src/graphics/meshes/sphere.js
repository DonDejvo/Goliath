import { vec4 } from "gl-matrix";
import { LinearSpline } from "../../math/linear-spline.js";
import { Mesh } from "../mesh.js";

class Sphere extends Mesh {

    onInit() {

        if(this.options.radius === undefined) {
            this.options.radius = 0.5;
        }
        const radius = this.options.radius;
        const widthSegments = this.options.widthSegments || 32;
        const heightSegments = this.options.heightSegments || 16;
        const textureInvert = this.options.textureInvert === true;

        const positions = [];
        const uvs = [];
        const colors = [];
        const indices = [];

        const positionCache = [];
        const uvCache = [];
        const colorCache = [];

        for (let i = 0; i <= heightSegments; ++i) {

            const angle1 = i / heightSegments * Math.PI;
            const sin1 = Math.sin(angle1);
            const cos1 = Math.cos(angle1);

            for (let j = 0; j <= widthSegments; ++j) {

                const angle2 = j / widthSegments * 2 * Math.PI;
                const sin2 = Math.sin(angle2);
                const cos2 = Math.cos(angle2);

                positionCache.push([
                    sin1 * cos2 * radius,
                    cos1 * radius,
                    sin1 * sin2 * radius
                ]);
                uvCache.push([
                    1 - j / widthSegments,
                    i / heightSegments
                ]);
            }
        }

        if(textureInvert) {
            for(let i = 0; i < uvCache.length; i += 2) {
                uvCache[i] = 1 - uvCache[i];
            }
        }

        if (this.options.colors === undefined) {

            for (let i = 0; i < (widthSegments + 1) * (heightSegments + 1); ++i) {
                colorCache.push([1, 1, 1, 1]);
            }

        } else if(this.options.colors instanceof LinearSpline) {

            for(let i = 0; i <= heightSegments; ++i) {

                const c = this.options.colors.getValue(i / heightSegments);

                for(let j = 0; j <= widthSegments; ++j) {
                    colorCache.push(c);
                }
            }

        } else if (this.options.colors.length == 1) {

            const c = this.options.colors[0];

            for (let i = 0; i < (widthSegments + 1) * (heightSegments + 1); ++i) {
                colorCache.push(c);
            }

        } else {

            throw new Error("options.colors requires 1 elements");
        }

        let indexOffset = 0;
        for(let i = 0; i < heightSegments; ++i) {
            for(let j = 0; j < widthSegments; ++j) {

                const p1 = i * (widthSegments + 1) + j;
                const p2 = p1 + (widthSegments + 1);

                const indexCache = [p1, p1 + 1, p2 + 1, p2];

                for(let idx of indexCache) {
                    positions.push(...positionCache[idx]);
                    uvs.push(...uvCache[idx]);
                    colors.push(...colorCache[idx]);
                }

                indices.push(
                    indexOffset, indexOffset + 1, indexOffset + 2,
                    indexOffset, indexOffset + 2, indexOffset + 3
                );
                indexOffset += 4;
            }
        }

        this.bufferData(positions, 3, "positions");
        this.bufferData(colors, 4, "colors");
        this.bufferData(uvs, 2, "uvs");
        this.bufferData(indices, 0, "index");

    }

}

export {
    Sphere
}