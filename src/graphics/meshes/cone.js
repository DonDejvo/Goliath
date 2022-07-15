import { LinearSpline } from "../../math/linear-spline.js";
import { Mesh } from "../mesh.js";

class Cone extends Mesh {

    onInit() {

        if(this.options.radius === undefined) {
            this.options.radius = 0.5;
        }
        const radius = this.options.radius;
        if(this.options.height === undefined) {
            this.options.height = 1;
        }
        const halfHeight = this.options.height / 2;
        const widthSegments = this.options.widthSegments || 32;

        const positions = [];
        const colors = [];
        const indices = [];

        const positionCache = [];
        const colorCache = [];

        positionCache.push([0, halfHeight, 0]);

        for(let i = 0; i <= widthSegments; ++i) {
            const angle1 = i / widthSegments * 2 * Math.PI;
            const sin1 = Math.sin(angle1);
            const cos1 = Math.cos(angle1);

            positionCache.push([cos1 * radius, -halfHeight, sin1 * radius]);
        }

        if(this.options.colors === undefined) {
            for(let i = 0; i <= widthSegments; ++i) {
                colorCache.push([1, 1, 1, 1]);
            }
        } else if(this.options.colors instanceof LinearSpline) {
            for(let i = 0; i <= widthSegments; ++i) {
                const c = this.options.colors.getValue(i / (widthSegments));
                colorCache.push(c);
            }
        } else if(this.options.colors.length == 1) {
            const c = this.options.colors[0];
             for(let i = 0; i <= widthSegments; ++i) {
                 colorCache.push(c);
             }
        } else {
            throw new Error("");
        }

        let indexOffset = 0;
        for(let i = 1; i <= widthSegments; ++i) {

            const indexCache = [0, i, i + 1];
            for(let idx of indexCache) {
                positions.push(...positionCache[idx]);
                colors.push(...colorCache[i]);
            }

            indices.push(
                indexOffset, indexOffset + 1, indexOffset + 2
            );
            indexOffset += 3;

            if(i != 0 && i != widthSegments) {
                indices.push(
                    1, indexOffset + 1, (indexOffset + 4) % (widthSegments * 3)
                );
            }
        }

        this.bufferData(positions, 3, "positions");
        this.bufferData(colors, 4, "colors");
        this.bufferData(indices, 0, "index");

    }

}

export {
    Cone
}