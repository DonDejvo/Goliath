import { mat3, mat4, quat, vec3 } from "gl-matrix";
import { Mesh } from "./mesh.js";
import { ShaderInstance } from "./shader-instance.js";
import { Texture } from "./texture.js";

class Drawable {

    /**
     * 
     * @type {Mesh}
     */
    mesh;

    /**
     * 
     * @type {ShaderInstance}
     */
    shader;

    /**
     * 
     * @type {Texture}
     */
    texture;

    /**
     * 
     * @type {vec3}
     */
    position = vec3.create();

    /**
     * 
     * @type {quat}
     */
    rotation = quat.create();

    /**
     * 
     * @type {vec3}
     */
     scale = vec3.fromValues(1, 1, 1);

    constructor(mesh, shader, texture) {
        this.mesh = mesh;
        this.shader = shader;
        this.texture = texture;
    }

    draw(constants) {
        this.shader.activate();

        const modelMatrix = mat4.create();
        mat4.fromRotationTranslationScale(
            modelMatrix,
            this.rotation,
            this.position,
            this.scale);

        const viewMatrix = constants.viewMatrix;
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

        const normalMatrix = mat3.create();
        mat3.fromMat4(normalMatrix, modelMatrix);
        mat3.invert(normalMatrix, normalMatrix);
        mat3.transpose(normalMatrix, normalMatrix);

        this.shader.setUniform("modelViewMatrix", modelViewMatrix);
        this.shader.setUniform("modelMatrix", modelMatrix);
        this.shader.setUniform("normalMatrix", normalMatrix);

        this.shader.bind(constants);
        this.mesh.bind(this.shader);

        this.mesh.draw();
    }

}

export {
    Drawable
}