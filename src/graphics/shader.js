import { Gol } from "../gol.js";

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
    constructor(vsrc, fsrc) {
        const vshader = this.compileShader(vsrc, Gol.gl.VERTEX_SHADER);
        const fshader = this.compileShader(fsrc, Gol.gl.FRAGMENT_SHADER);

        this.program = Gol.gl.createProgram();
        Gol.gl.attachShader(this.program, vshader);
        Gol.gl.attachShader(this.program, fshader);
        Gol.gl.linkProgram(this.program);

        if (!Gol.gl.getProgramParameter(this.program, Gol.gl.LINK_STATUS)) {
            console.log(Gol.gl.getProgramInfoLog(this.program));
            throw new Error("program unable to link");
        }

        this.attribs = {
            positions: Gol.gl.getAttribLocation(this.program, "position"),
            normals: Gol.gl.getAttribLocation(this.program, "normal"),
            colors: Gol.gl.getAttribLocation(this.program, "color"),
            uvs: Gol.gl.getAttribLocation(this.program, "uv"),
            sizes: Gol.gl.getAttribLocation(this.program, "size")
        };

        this.uniforms = [
            {
                name: "projectionMatrix",
                type: "mat4",
                location: Gol.gl.getUniformLocation(this.program, "projectionMatrix")
            },
            {
                name: "modelViewMatrix",
                type: "mat4",
                location: Gol.gl.getUniformLocation(this.program, "modelViewMatrix"),
            },
            {
                name: "modelMatrix",
                type: "mat4",
                location: Gol.gl.getUniformLocation(this.program, "modelMatrix"),
            },
            {
                name: "normalMatrix",
                type: "mat3",
                location: Gol.gl.getUniformLocation(this.program, "normalMatrix"),
            },
            {
                name: "lightColor",
                type: "vec3",
                location: Gol.gl.getUniformLocation(this.program, "lightColor"),
            },
            {
                name: "lightDirection",
                type: "vec3",
                location: Gol.gl.getUniformLocation(this.program, "lightDirection"),
            },
            {
                name: "lightPosition",
                type: "vec3",
                location: Gol.gl.getUniformLocation(this.program, "lightPosition"),
            },
            {
                name: "cameraPosition",
                type: "vec3",
                location: Gol.gl.getUniformLocation(this.program, "cameraPosition"),
            },
            {
                name: "pointMultiplier",
                type: "float",
                location: Gol.gl.getUniformLocation(this.program, "pointMultiplier")
            },
            {
                name: "ambientColor",
                type: "vec3",
                location: Gol.gl.getUniformLocation(this.program, "ambientColor")
            },
            {
                name: "uvOffset",
                type: "vec2",
                location: Gol.gl.getUniformLocation(this.program, "uvOffset")
            }
        ];
    }

    activate() {
        Gol.gl.useProgram(this.program);
    }

    compileShader(src, type) {
        const shader = Gol.gl.createShader(type);

        Gol.gl.shaderSource(shader, src);
        Gol.gl.compileShader(shader);

        if (!Gol.gl.getShaderParameter(shader, Gol.gl.COMPILE_STATUS)) {
            console.log(Gol.gl.getShaderInfoLog(shader));
            throw new Error("shader unable to compile");
        }
        return shader;
    }

    static SIMPLE_VS = `
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    attribute vec3 position;
    attribute vec4 color;

    varying vec4 vColor;

    void main(void) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vColor = color;
    }
    `;

    static SIMPLE_FS = `
    precision mediump float;

    varying vec4 vColor;

    uniform vec3 ambientColor;

    void main(void) {
        gl_FragColor = vec4(vColor.rgb * ambientColor, vColor.a);
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

    void main(void) {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        vColor = color;
        vUv = uv;
    }
    `;

    static TEXTURE_FS = `
    precision mediump float;

    varying vec4 vColor;
    varying vec2 vUv;

    uniform sampler2D tex;
    uniform vec3 ambientColor;
    uniform vec2 uvOffset;

    void main(void) {
        vec4 texColor = texture2D(tex, vUv + uvOffset);
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor, texColor.a);
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
        gl_FragColor = vec4(vColor.rgb * texColor.rgb * ambientColor * texColor.a, vColor.a);
    }
    `;
}

export {
    Shader
}