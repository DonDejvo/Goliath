import { mat4, vec3 } from "gl-matrix";
import { Camera } from "./camera.js";


class PerspectiveCamera extends Camera {

    /**
     * 
     * @type {number}
     */
    fov;

    constructor(fov, viewportWidth, viewportHeight, near, far) {
        super();
        this.fov = fov;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.near = near;
        this.far = far;

        this.updateProjection();
    }

    updateProjection() {
        const aspect = this.viewportWidth / this.viewportHeight;
        mat4.perspective(this.projectionMatrix, this.fov / 180 * Math.PI, aspect, this.near, this.far);
    }

}

export {
    PerspectiveCamera
}