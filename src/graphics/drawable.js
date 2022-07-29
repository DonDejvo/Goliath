import { mat3, mat4, quat, vec3 } from 'gl-matrix';
import { Mesh } from './mesh.js';
import { ShaderInstance } from './shader-instance.js';
import { Texture } from './texture.js';

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
    scale = vec3.fromValues( 1, 1, 1 );

    /**
      *
      * @type {Drawable}
      */
    parent = null;

    /**
      *
      * @type {mat4}
      */
    modelMatrix = mat4.create();

    /**
      *
      * @type {mat4}
      */
    normalMatrix = mat4.create();

    /**
      *
      * @type {boolean}
      */
    matrixAutoUpdate = true;

    /**
      *
      * @type {boolean}
      */
    matrixNeedsUpdate = true;

    constructor( mesh, shader, texture ) {

        this.mesh = mesh;
        this.shader = shader;
        this.texture = texture;

    }

    setShader(shader) {
        this.shader = shader;
    }

    updateMatrix() {

        if ( this.matrixNeedsUpdate || this.matrixAutoUpdate ) {

            this.matrixNeedsUpdate = false;

            mat4.fromRotationTranslationScale(
                this.modelMatrix,
                this.rotation,
                this.position,
                this.scale );

            mat3.fromMat4( this.normalMatrix, this.modelMatrix );
            mat3.invert( this.normalMatrix, this.normalMatrix );
            mat3.transpose( this.normalMatrix, this.normalMatrix );

        }

    }

    draw( constants ) {

        this.shader.activate();

        if ( this.texture ) {

            this.texture.bind();

        }

        this.updateMatrix();

        const viewMatrix = constants.viewMatrix;
        const modelViewMatrix = mat4.create();

        mat4.multiply( modelViewMatrix, viewMatrix, this.modelMatrix );

        this.shader.setUniform( 'modelViewMatrix', modelViewMatrix );
        this.shader.setUniform( 'modelMatrix', this.modelMatrix );
        this.shader.setUniform( 'normalMatrix', this.normalMatrix );

        this.shader.bind( constants );
        this.mesh.bind( this.shader );

        this.mesh.draw();

        this.mesh.unbind( this.shader );

    }

}

export {
    Drawable
};
