import { Gol } from "../gol.js";
import { Shader } from "./shader.js";

class ShaderInstance {

    /**
     * 
     * @type {Shader}
     */
     shaderData;

    /**
     * 
     * @type {Map<string, number | Float32List>}
     */
    uniforms = new Map();

    constructor(shader) {
        this.shaderData = shader;
    }

    setUniform(name, val) {
        this.uniforms.set(name, val);
    }

    activate() {
        this.shaderData.activate();
    }

    bind(constants) {
        for(let name in this.shaderData.uniforms) {
            const info = this.shaderData.uniforms[name];
            let value = constants[name];
            if (this.uniforms.has(name)) {
                value = this.uniforms.get(name);
            }

            if (value && info.location) {
                const type = info.type;
                const loc = info.location;

                switch (type) {
                    case "mat4":
                        Gol.gl.uniformMatrix4fv(loc, false, value);
                        break;
                    case "mat3":
                        Gol.gl.uniformMatrix3fv(loc, false, val);
                        break;
                    case "vec4":
                        Gol.gl.uniform4fv(loc, value);
                        break;
                    case "vec3":
                        Gol.gl.uniform3fv(loc, value);
                        break;
                    case "vec2":
                        Gol.gl.uniform2fv(loc, value);
                        break;
                    case "float":
                        Gol.gl.uniform1f(loc, value);
                        break;
                }
            }
        }
    }

}

export {
    ShaderInstance
}