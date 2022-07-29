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
            {
                name: "fogTime",
                type: "float",
                location: Gol.gl.getUniformLocation(this.program, "fogTime")
            }
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

<<<<<<< HEAD
=======
        if (!Gol.gl.getShaderParameter(shader, Gol.gl.COMPILE_STATUS)) {
            console.log(Gol.gl.getShaderInfoLog(shader));
            console.log(src);
            throw new Error("shader unable to compile");
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
        }

        return shader;

    }

    dispose() {

    }

    static create( type, opts = {} ) {

        switch ( type ) {

<<<<<<< HEAD
            case this.Type.SIMPLE: {

                const vsrc = [ this.SIMPLE_VS ].join( '\n' );

                const fsrc = [
                    opts.useFog === true ? '#define USE_FOG' : '',
=======
        const floatPrecision = "precision mediump float;";

        const applyCustomProcessPosition = (vs) => {
            return vs.replace("{{USER}}", opts.onCustomProcessPosition === undefined ? "" : opts.onCustomProcessPosition);
        }
        const useFog = opts.useFog === true ? "#define USE_FOG" : "";
        const hasCustomUniforms = Array.isArray(opts.uniforms);

        let vertUniforms = "";
        let fragUniforms = "";
        if(hasCustomUniforms) {
            opts.uniforms.forEach(e => {
                const str = `\tuniform ${e.type} ${e.name};\n`;
                switch(e.shader) {
                    case "vert":
                        vertUniforms += str;
                        break;
                    case "frag":
                        fragUniforms += str;
                        break;
                }
            });
        }

        let vsrc, fsrc;

        switch(type) {
            case this.Type.SIMPLE: {
                vsrc = [
                    vertUniforms,
                    useFog,
                    applyCustomProcessPosition(this.SIMPLE_VS)
                ].join("\n");

                fsrc = [
                    floatPrecision,
                    fragUniforms,
                    useFog,
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
                    this.SIMPLE_FS
                ].join( '\n' );

                return new Shader( vsrc, fsrc );

<<<<<<< HEAD
=======
                break;
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
            }

            case this.Type.TEXTURE: {
<<<<<<< HEAD

                const vsrc = [ this.TEXTURE_VS ].join( '\n' );

                const fsrc = [
                    opts.useFog === true ? '#define USE_FOG' : '',
=======
                vsrc = [
                    vertUniforms,
                    useFog,
                    applyCustomProcessPosition(this.TEXTURE_VS)
                ].join("\n");

                fsrc = [
                    floatPrecision,
                    fragUniforms,
                    useFog,
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
                    this.TEXTURE_FS
                ].join( '\n' );

                return new Shader( vsrc, fsrc );

<<<<<<< HEAD
            }

            case this.Type.PARTICLE: {

                return new Shader( this.PARTICLE_VS, this.PARTICLE_FS );

            }

            default:
                throw new Error( 'Type not found: ' + type );

=======
                break;
            }  
            case this.Type.PARTICLE: {
                vsrc = [
                    vertUniforms,
                    this.PARTICLE_VS
                ].join("\n");

                fsrc = [
                    floatPrecision,
                    fragUniforms,
                    this.PARTICLE_FS
                ].join("\n");

                break;
            }
            default: {
                throw new Error("Type not found: " + type);
            }
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
        }

        const shader = new Shader(vsrc, fsrc);

        if(hasCustomUniforms) {
            for(let uniform of opts.uniforms) {
                shader.uniforms.push({
                    name: uniform.name,
                    type: uniform.type,
                    location: Gol.gl.getUniformLocation(shader.program, uniform.name)
                });
            }
        }

        return shader;

    }

<<<<<<< HEAD
    static Type = Object.freeze( {
        SIMPLE: 1,
        TEXTURE: 2,
        PARTICLE: 3
    } );
=======
    static Type = Object.freeze({
        SIMPLE: "simple",
        TEXTURE: "texture",
        PARTICLE: "particle"
    });
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27

    static PROC_POS_FUNC = `
    vec3 proc_pos(vec3 position) {
        {{USER}}
        return position;
    }
    `;

    static FOG_VERT_PARAMS = `
    #ifdef USE_FOG
    varying vec3 vWorldPosition;
    #endif
    `;

    static FOG_VERT = `
    #ifdef USE_FOG
    vWorldPosition = worldPosition.xyz;
    #endif
    `;

    static FOG_FRAG_PARAMS = `
    #ifdef USE_FOG
    varying vec3 vWorldPosition;
    uniform vec3 fogColor;
    uniform float fogNear;
    uniform float fogFar;
    uniform float fogTime;
    #endif
    `;

    static FOG_FRAG = `
    #ifdef USE_FOG
    vec3 fogDirection = normalize(vWorldPosition);
    float fogDepth = length(vWorldPosition);

    float fogFactor = smoothstep(fogNear, fogFar, fogDepth);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    gl_FragColor = mix( gl_FragColor, vec4(fogColor, fogAlpha), fogFactor);
    #endif
    `;

    static SIMPLE_VS = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec4 color;

    varying vec4 vColor;

    ${this.FOG_VERT_PARAMS}

    ${this.PROC_POS_FUNC}

    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(proc_pos(position), 1.0);
        gl_Position = projectionMatrix * worldPosition;
        vColor = color;
        ${this.FOG_VERT}
    }
    `;

    static SIMPLE_FS = `
    varying vec4 vColor;
    uniform vec3 ambientColor;
    uniform vec3 cameraPosition;

    ${this.FOG_FRAG_PARAMS}

    void main(void) {
        gl_FragColor = vec4(vColor.rgb * ambientColor, vColor.a);
        float fogAlpha = 1.0;
        ${this.FOG_FRAG}
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
    
    ${this.FOG_VERT_PARAMS}

    ${this.PROC_POS_FUNC}

    void main(void) {
        vec4 worldPosition = modelViewMatrix * vec4(proc_pos(position), 1.0);
        gl_Position = projectionMatrix * worldPosition;
        vColor = color;
        vUv = uv;
        ${this.FOG_VERT}
    }
    `;

    static TEXTURE_FS = ` 
    varying vec4 vColor;
    varying vec2 vUv;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    uniform vec2 uvOffset;
    uniform vec3 cameraPosition;

    ${this.FOG_FRAG_PARAMS}

    void main(void) {
        vec4 texColor = texture2D(tex, vUv + uvOffset);
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor, texColor.a * vColor.a);
        float fogAlpha = texColor.a;
        ${this.FOG_FRAG}
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
        vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * worldPosition;
        gl_PointSize = size * pointMultiplier / gl_Position.w;
        vColor = color;
    }
    `;

    static PARTICLE_FS = `
    varying vec4 vColor;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    uniform vec3 cameraPosition;
    
    void main(void) {
        vec4 texColor = texture2D(tex, gl_PointCoord);
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor * texColor.a, texColor.a) * vColor.a;
    }
    `;

}

export {
    Shader
};
