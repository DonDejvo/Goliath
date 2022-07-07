import { Gol } from '../gol.js';

class Shader {

    /**
     *
     * @type {WebGLProgram}
     */
    program;

    /**
     *
     * @param {string} vsrc Vertex source
     * @param {string} fsrc Fragment source
     */
    constructor( vsrc, fsrc ) {

        const vshader = this.compileShader( vsrc, Gol.gl.VERTEX_SHADER );
        const fshader = this.compileShader( fsrc, Gol.gl.FRAGMENT_SHADER );

        this.program = Gol.gl.createProgram();
        Gol.gl.attachShader( this.program, vshader );
        Gol.gl.attachShader( this.program, fshader );
        Gol.gl.linkProgram( this.program );

        if ( !Gol.gl.getProgramParameter( this.program, Gol.gl.LINK_STATUS ) ) {

            console.log( Gol.gl.getProgramInfoLog( this.program ) );
            throw new Error( 'program unable to link' );

        }

        this.attribs = {
            positions: Gol.gl.getAttribLocation( this.program, 'position' ),
            normals: Gol.gl.getAttribLocation( this.program, 'normal' ),
            colors: Gol.gl.getAttribLocation( this.program, 'color' ),
            uvs: Gol.gl.getAttribLocation( this.program, 'uv' ),
            sizes: Gol.gl.getAttribLocation( this.program, 'size' )
        };

        this.uniforms = [
            {
                name: 'projectionMatrix',
                type: 'mat4',
                location: Gol.gl.getUniformLocation( this.program, 'projectionMatrix' )
            },
            {
                name: 'modelViewMatrix',
                type: 'mat4',
                location: Gol.gl.getUniformLocation( this.program, 'modelViewMatrix' ),
            },
            {
                name: 'modelMatrix',
                type: 'mat4',
                location: Gol.gl.getUniformLocation( this.program, 'modelMatrix' ),
            },
            {
                name: 'normalMatrix',
                type: 'mat3',
                location: Gol.gl.getUniformLocation( this.program, 'normalMatrix' ),
            },
            {
                name: 'lightColor',
                type: 'vec3',
                location: Gol.gl.getUniformLocation( this.program, 'lightColor' ),
            },
            {
                name: 'lightDirection',
                type: 'vec3',
                location: Gol.gl.getUniformLocation( this.program, 'lightDirection' ),
            },
            {
                name: 'lightPosition',
                type: 'vec3',
                location: Gol.gl.getUniformLocation( this.program, 'lightPosition' ),
            },
            {
                name: 'cameraPosition',
                type: 'vec3',
                location: Gol.gl.getUniformLocation( this.program, 'cameraPosition' ),
            },
            {
                name: 'pointMultiplier',
                type: 'float',
                location: Gol.gl.getUniformLocation( this.program, 'pointMultiplier' )
            },
            {
                name: 'ambientColor',
                type: 'vec3',
                location: Gol.gl.getUniformLocation( this.program, 'ambientColor' )
            },
            {
                name: 'uvOffset',
                type: 'vec2',
                location: Gol.gl.getUniformLocation( this.program, 'uvOffset' )
            },
            {
                name: 'fogColor',
                type: 'vec3',
                location: Gol.gl.getUniformLocation( this.program, 'fogColor' )
            },
            {
                name: 'fogNear',
                type: 'float',
                location: Gol.gl.getUniformLocation( this.program, 'fogNear' )
            },
            {
                name: 'fogFar',
                type: 'float',
                location: Gol.gl.getUniformLocation( this.program, 'fogFar' )
            },
        ];

    }

    activate() {

        Gol.gl.useProgram( this.program );

    }

    compileShader( src, type ) {

        const shader = Gol.gl.createShader( type );

        Gol.gl.shaderSource( shader, src );
        Gol.gl.compileShader( shader );

        if ( !Gol.gl.getShaderParameter( shader, Gol.gl.COMPILE_STATUS ) ) {

            console.log( Gol.gl.getShaderInfoLog( shader ) );
            throw new Error( 'shader unable to compile' );

        }

        return shader;

    }

    dispose() {

    }

    static create( type, opts = {} ) {

        switch ( type ) {

            case this.Type.SIMPLE: {

                const vsrc = [ this.SIMPLE_VS ].join( '\n' );

                const fsrc = [
                    opts.useFog === true ? '#define USE_FOG' : '',
                    this.SIMPLE_FS
                ].join( '\n' );

                return new Shader( vsrc, fsrc );

            }

            case this.Type.TEXTURE: {

                const vsrc = [ this.TEXTURE_VS ].join( '\n' );

                const fsrc = [
                    opts.useFog === true ? '#define USE_FOG' : '',
                    this.TEXTURE_FS
                ].join( '\n' );

                return new Shader( vsrc, fsrc );

            }

            case this.Type.PARTICLE: {

                return new Shader( this.PARTICLE_VS, this.PARTICLE_FS );

            }

            default:
                throw new Error( 'Type not found: ' + type );

        }

    }

    static Type = Object.freeze( {
        SIMPLE: 1,
        TEXTURE: 2,
        PARTICLE: 3
    } );

    static SIMPLE_VS = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec4 color;

    varying vec4 vColor;
    varying vec3 vPosition;

    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * worldPosition;
        vColor = color;
        vPosition = worldPosition.xyz;
    }
    `;

    static SIMPLE_FS = `
    precision mediump float;

    varying vec4 vColor;
    varying vec3 vPosition;

    uniform vec3 ambientColor;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    void main(void) {
        vec4 color = vec4(vColor.rgb * ambientColor, vColor.a);
        #ifdef USE_FOG
        float fogDistance = length(vPosition);
        float fogAmount = smoothstep(fogNear, fogFar, fogDistance);
        color = mix(color, vec4(fogColor, 1.0), fogAmount);
        #endif
        gl_FragColor = color;
    }
    `;

    static TEXTURE_VS = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec4 color;
    attribute vec2 uv;

    varying vec4 vColor;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * worldPosition;
        vColor = color;
        vUv = uv;
        vPosition = worldPosition.xyz;
    }
    `;

    static TEXTURE_FS = ` 
    precision mediump float;

    varying vec4 vColor;
    varying vec2 vUv;
    varying vec3 vPosition;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    uniform vec2 uvOffset;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;

    void main(void) {
        vec4 texColor = texture2D(tex, vUv + uvOffset);
        vec4 color = vec4(vColor.rgb * texColor.rgb * ambientColor, texColor.a * vColor.a);
        #ifdef USE_FOG
        float fogDistance = length(vPosition);
        float fogAmount = smoothstep(fogNear, fogFar, fogDistance);
        color = mix(color, vec4(fogColor, texColor.a), fogAmount);
        #endif
        gl_FragColor = color;
    }
    `;

    static PARTICLE_VS = `
    attribute vec3 position;
    attribute vec4 color;
    attribute float size;
    
    uniform float pointMultiplier;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    
    varying vec4 vColor;
    
    void main(void) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * pointMultiplier / gl_Position.w;
        vColor = color;
    }
    `;

    static PARTICLE_FS = `
    precision mediump float;
    
    varying vec4 vColor;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    
    void main(void) {
        vec4 texColor = texture2D(tex, gl_PointCoord);
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor * texColor.a, texColor.a);
        gl_FragColor *= vColor.a;
    }
    `;

}

export {
    Shader
};
