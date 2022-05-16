import { mat4 } from "gl-matrix";
import { Gol } from "../gol.js";
import { Mesh } from "./mesh.js";
import { ShaderInstance } from "./shader-instance.js";
import { Texture } from "./texture.js";


class ParticleSystem {

    /**
     * 
     * @type {Mesh}
     */
    mesh;

    /**
     * 
     * @type {Texture}
     */
    texture;

    /**
     * 
     * @type {ShaderInstance}
     */
    shader;


    particles = [];

    constructor(params) {
        this.mesh = new Mesh();
        this.texture = params.texture;
        this.shader = new ShaderInstance(Gol.graphics.getShader("particle"));
    }

    addParticles() {}

    updateParticles() {}

    updateGeometry() {

        const positions = [];
        const colors = [];
        const sizes = [];

        for(let p of this.particles) {

            positions.push(...p.position);
            colors.push(...p.color, p.alpha);
            sizes.push(p.size);
        }

        this.mesh.bufferData(positions, 3, "positions");
        this.mesh.bufferData(colors, 4, "colors");
        this.mesh.bufferData(sizes, 1, "sizes");
    }

    draw(constants) {
        this.shader.activate();

        this.texture.bind();

        const modelMatrix = mat4.create();

        const viewMatrix = constants.viewMatrix;
        const modelViewMatrix = mat4.create();
        mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);

        this.shader.setUniform("modelViewMatrix", modelViewMatrix);

        this.shader.bind(constants);
        this.mesh.bind(this.shader);
        
        const vertCount = this.particles.length;

        Gol.gl.drawArrays(Gol.gl.POINTS, 0, vertCount);

        this.mesh.unbind(this.shader);
    }

    update() {
        this.addParticles();
        this.updateParticles();
        this.updateGeometry();
    }

}

export {
    ParticleSystem
}