import { vec3 } from "gl-matrix";
import { Drawable } from "./drawable.js";
import { Mesh } from "./mesh.js";

class DrawableGroup extends Drawable {

    /**
     * 
     * @type {number}
     */
    idx = 0;

    constructor(shader, texture) {
        super(
            new Mesh(), 
            shader, 
            texture
        );

        if(shader.shaderData.attribs["index"] != -1) {
            this.mesh.createBuffer("index", 0);        
        }
        if(shader.shaderData.attribs["positions"] != -1) {
            this.mesh.createBuffer("positions", 3);
        }
        if(shader.shaderData.attribs["uvs"] != -1) {
            this.mesh.createBuffer("uvs", 2);
        }
        if(shader.shaderData.attribs["colors"] != -1) {
            this.mesh.createBuffer("colors", 4);
        }
    }

    add(drawable) {
        drawable.updateMatrix();

        const count = drawable.mesh.getBuffer("positions").data.length / 3;

        this.mesh.buffers.forEach((info, name) => {

            const data = drawable.mesh.getBuffer(name).data;
            
            switch(name) {
                case "positions": 
                    for(let i = 0; i < data.length; i += 3) {
                        const vec = vec3.fromValues(data[i], data[i + 1], data[i + 2]);

                        vec3.transformMat4(vec, vec, drawable.modelMatrix);

                        for(let j = 0; j < 3; ++j) {
                            info.data.push(vec[j]);
                        }
                    }
                    
                    break;
                case "index":
                    for (let i = 0; i < data.length; ++i) {
                        info.data.push(data[i] + this.idx);
                    }
                    break;
                default:
                    for (let i = 0; i < data.length; ++i) {
                        info.data.push(data[i]);
                    }
            }

        });

        this.idx += count;
    }

}

export {
    DrawableGroup
}