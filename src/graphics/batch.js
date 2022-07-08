import { mat4, vec3 } from 'gl-matrix';
import { Mesh } from './mesh.js';

class Batch {

    static MAX_COUNT = 65536;

    /**
     *
     * @type {Mesh}
     */
    mesh = new Mesh();

    /**
     *
     * @type {ShaderInstance}
     */
    shader;

    /**
     * @type {number}
     */
    idx = 0;

    /**
     *
     *
     */
    texture = null;

    /**
     *
     * @type {Object}
     */
    constants = {
        projectionMatrix: mat4.create(),
        viewMatrix: mat4.create(),
        cameraMatrix: mat4.create(),
        cameraPosition: vec3.create(),
    };

    constructor( shader ) {

        this.shader = shader;

        if ( shader.shaderData.attribs[ 'index' ] != - 1 ) {

            this.mesh.createBuffer( 'index', 0 );

        }

        if ( shader.shaderData.attribs[ 'positions' ] != - 1 ) {

            this.mesh.createBuffer( 'positions', 3 );

        }

        if ( shader.shaderData.attribs[ 'uvs' ] != - 1 ) {

            this.mesh.createBuffer( 'uvs', 2 );

        }

        if ( shader.shaderData.attribs[ 'colors' ] != - 1 ) {

            this.mesh.createBuffer( 'colors', 4 );

        }

    }

    setConstants( c ) {

        this.constants = { ...c };

    }

    begin() {

        this.idx = 0;
        this.mesh.buffers.forEach( ( info ) => {

            info.data.length = 0;

        } );
        this.texture = null;

    }

    draw( drawable ) {

        const count = drawable.mesh.getBuffer( 'positions' ).data.length / 3;

        if (
            this.idx + count > Batch.MAX_COUNT ||
            drawable.texture != this.texture
        ) {

            this.flush();

        }

        this.texture = drawable.texture;

        drawable.updateMatrix();

        this.mesh.buffers.forEach( ( info, name ) => {

            const data = drawable.mesh.getBuffer( name ).data;

            switch ( name ) {

                case 'positions':
                    for ( let i = 0; i < data.length; i += 3 ) {

                        const vec = vec3.fromValues( data[ i ], data[ i + 1 ], data[ i + 2 ] );

                        vec3.transformMat4( vec, vec, drawable.modelMatrix );

                        for ( let j = 0; j < 3; ++j ) {

                            info.data.push( vec[ j ] );

                        }

                    }

                    break;
                case 'index':
                    for ( let i = 0; i < data.length; ++i ) {

                        info.data.push( data[ i ] + this.idx );

                    }

                    break;

                default:
                    for ( let i = 0; i < data.length; ++i ) {

                        info.data.push( data[ i ] );

                    }

            }

        } );

        this.idx += count;

    }

    end() {

        this.flush();

    }

    flush() {

        if ( this.idx == 0 ) {

            return;

        }

        this.mesh.buffers.forEach( ( _, name ) => {

            this.mesh.initBuffer( name );

        } );

        this.shader.activate();

        if ( this.texture ) {

            this.texture.bind();

        }

        const modelMatrix = mat4.create();
        const normalMatrix = mat4.create();

        const viewMatrix = this.constants.viewMatrix;
        const modelViewMatrix = mat4.create();

        mat4.multiply( modelViewMatrix, viewMatrix, modelMatrix );

        this.shader.setUniform( 'modelViewMatrix', modelViewMatrix );
        this.shader.setUniform( 'modelMatrix', modelMatrix );
        this.shader.setUniform( 'normalMatrix', normalMatrix );

        this.shader.bind( this.constants );
        this.mesh.bind( this.shader );

        this.mesh.draw();

        this.mesh.unbind( this.shader );

        this.idx = 0;
        this.mesh.buffers.forEach( ( info ) => {

            info.data.length = 0;

        } );

    }

}

export {
    Batch
};
