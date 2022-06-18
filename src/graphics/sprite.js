import { Gol } from "../gol.js";
import { Drawable } from "./drawable.js";
import { Quad } from "./meshes/quad.js";
import { ShaderInstance } from "./shader-instance.js";

class Sprite extends Drawable {

    regionX;

    regionY;

    regionWidth;

    regionHeight;

    constructor(...args) {
        const texture = args[0];
        let srcX = 0;
        let srcY = 0;
        let srcWidth = texture.width;
        let srcHeight = texture.height;
        if(args.length == 3) {
            srcWidth = args[1];
            srcHeight = args[2];
        } else if(args.length == 5) {
            srcX = args[1];
            srcY = args[2];
            srcWidth = args[3];
            srcHeight = args[4];
        }
        super(
            new Quad(),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            texture
        );

        //this.setRegionSize(srcWidth, srcHeight);
        //this.setRegionPosition(srcX, srcY);
        this.setRegion(srcX, srcY, srcWidth, srcHeight);
    }

    setRegion(x, y, width, height) {
        this.regionX = x;
        this.regionY = y;
        this.regionWidth = width;
        this.regionHeight = height;

        const texWidth = this.texture.width, texHeight = this.texture.height;

        const uvs = [
            x / texWidth, y / texHeight,
            (x + width) / texWidth, y / texHeight,
            (x + width) / texWidth, (y + height) / texHeight,
            x / texWidth, (y + height) / texHeight
        ];
        this.mesh.bufferData(uvs, 2, "uvs");
    }

    setRegionSize(width, height) {
        this.regionWidth = width;
        this.regionHeight = height;

        const uvs = [
            0, 0,
            width / this.texture.width, 0,
            width / this.texture.width, height / this.texture.height,
            0, height / this.texture.height
        ];
        this.mesh.bufferData(uvs, 2, "uvs");
    }

    setRegionPosition(x, y) {
        this.regionX = x;
        this.regionY = y;
        this.shader.setUniform("uvOffset", [x / this.texture.width, y / this.texture.height]);
    }

}

export {
    Sprite
}