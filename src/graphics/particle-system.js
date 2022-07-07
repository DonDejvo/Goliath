import { mat4, vec3 } from 'gl-matrix';
import { Gol } from '../gol.js';
import { Mesh } from './mesh.js';
import { ShaderInstance } from './shader-instance.js';
import { Texture } from './texture.js';

class Particle {

    /**
     *
     * @type {vec3}
     */
    position;

    /**
     *
     * @type {vec3}
     */
    velocity;

    /**
     *
     * @type {vec3}
     */
    color;

    /**
     *
     * @type {number}
     */
    alpha;

    /**
     *
     * @type {number}
     */
    size;

    /**
     *
     * @type {number}
     */
    life;

    /**
     *
     * @type {number}
     */
    maxLife;

    constructor( params ) {

        this.position = params.position;
        this.maxLife = params.life;
        this.life = params.life;
        this.size = params.size !== undefined ? params.size : 1;
        this.velocity = params.velocity || [ 0, 0, 0 ];
        this.color = params.color || [ 1, 1, 1 ];
        this.alpha = params.alpha !== undefined ? params.alpha : 1;

    }

    update() {

        this.life -= Gol.graphics.delta * 1000;

    }

}

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

    /**
     *
     * @type {Particle[]}
     */
    particles = [];

    constructor( params ) {

        this.mesh = new Mesh();
        this.texture = params.texture;
        this.shader = new ShaderInstance( Gol.graphics.getShader( 'particle' ) );

        this.onScreenResize( Gol.graphics.width, Gol.graphics.height );

    }

    onScreenResize( width, height ) {

        this.shader.setUniform( 'pointMultiplier', height / 2 * Math.tan( 30 * Math.PI / 180 ) );

    }

    addParticles() {}

    updateParticles() {}

    updateGeometry() {

        const positions = [];
        const colors = [];
        const sizes = [];

        for ( const p of this.particles ) {

            positions.push( ...p.position );
            colors.push( ...p.color, p.alpha );
            sizes.push( p.size );

        }

        this.mesh.bufferData( positions, 3, 'positions' );
        this.mesh.bufferData( colors, 4, 'colors' );
        this.mesh.bufferData( sizes, 1, 'sizes' );

    }

    draw( constants ) {

        this.shader.activate();

        this.texture.bind();

        const modelMatrix = mat4.create();

        const viewMatrix = constants.viewMatrix;
        const modelViewMatrix = mat4.create();

        mat4.multiply( modelViewMatrix, viewMatrix, modelMatrix );

        this.shader.setUniform( 'modelViewMatrix', modelViewMatrix );

        this.shader.bind( constants );
        this.mesh.bind( this.shader );

        const vertCount = this.particles.length;

        Gol.gl.drawArrays( Gol.gl.POINTS, 0, vertCount );

        this.mesh.unbind( this.shader );

    }

    update() {

        this.addParticles();
        this.updateParticles();
        this.updateGeometry();

    }

}

export {
    ParticleSystem,
    Particle
};
