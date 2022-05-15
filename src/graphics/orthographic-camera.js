import { mat4, vec2, vec3 } from "gl-matrix";
import { Camera } from "./camera.js";

class OrthographicCamera extends Camera {

    /**
     * 
     * @type {number}
     */
    zoom = 1;

    constructor(width, height) {
        super();

        this.near = 0;
        this.setToOrtho(width, height);
    }

    setToOrtho(width, height) {
        this.viewportWidth = width;
        this.viewportHeight = height;

        vec3.set(this.position, this.zoom * width / 2, this.zoom * height / 2, 0);

        this.updateProjection();
    }

    updateProjection() {
        mat4.ortho(this.projectionMatrix,
            this.zoom * -this.viewportWidth / 2,
            this.zoom * this.viewportWidth / 2,
            this.zoom * -this.viewportHeight / 2,
            this.zoom * this.viewportHeight / 2,
            this.near,
            this.far);
    }

    translate(...args) {

        if(args.length == 1) {
            vec3.set(this.position, ...args[0], 0);
        } else if(args.length == 2) {
            vec3.set(this.position, args[0], args[1], 0);
        } else {

            throw new Error("required 1 or 2 arguments");
        }
    }

    zoomBy(...args) {
        const val = args[0];

        this.zoom *= 1 + val;

        if(args.length == 2 || args.length == 3) {
            const delta = vec2.create();
            
            if(args.length == 2) {
                vec2.copy(delta, args[1]);
            } else {
                vec2.set(delta, ...args);
            }

            vec2.sub(delta, delta, this.position);
            vec2.scale(delta, delta, val);
            
            vec3.add(this.position, this.position, [...delta, 0]);
        }

    }

}

export {
    OrthographicCamera
}