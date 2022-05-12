import { glMatrix, mat4, vec3 } from "gl-matrix";

class Camera {

    /**
     * 
     * @type {vec3}
     */
    position = vec3.create();

    /**
     * 
     * @type {vec3}
     */
    direction = vec3.fromValues(0, 0, 1);

    /**
     * 
     * @type {vec3}
     */
    up = vec3.fromValues(0, 1, 0);

    /**
     * 
     * @type {mat4}
     */
    projectionMatrix = mat4.create();

    /**
     * 
     * @type {mat4}
     */
    viewMatrix = mat4.create();

    /**
     * 
     * @type {mat4}
     */
    cameraMatrix = mat4.create();

    /**
     * 
     * @type {number}
     */
    viewportWidth = 0;

    /**
     * 
     * @type {number}
     */
    viewportHeight = 0;

    /**
     * 
     * @type {number}
     */
    near = 1;

    /**
     * 
     * @type {number}
     */
    far = 100;

    /**
     * 
     * @type {vec3}
     */
    tpmVec = vec3.create();

    constructor() {}

    lookAt(...args) {
        if(args.length == 1) {
            vec3.copy(this.tpmVec, args[0]);
        } else if(args.length == 3) {
            vec3.set(this.tpmVec, ...args);
        } else {
            throw new Error("Required 1 or 3 arguments");
        }
        vec3.sub(this.tpmVec, this.position);
        vec3.normalize(this.tpmVec, this.tpmVec);
        const dot = this.tpmVec.dot(this.up);
        if(glMatrix.equals(dot, 1)) {
            vec3.negate(this.up, this.direction);
        } else if(glMatrix.equals(dot, -1)) {
            vec3.copy(this.up, this.direction);
        }
        vec3.copy(this.direction, this.tpmVec);
        vec3.cross(this.up, this.getRight(), this.direction);
        vec3.normalize(this.up, this.up);
    }

    getRight() {
        return vec3.cross(this.tpmVec, this.direction, this.up);
    }

    updateConstants(constants) {
        mat4.lookAt(this.viewMatrix, this.position, vec3.add(this.tpmVec, this.position, this.direction), this.up);
        mat4.invert(this.cameraMatrix, this.viewMatrix);

        constants["projectionMatrix"] = this.projectionMatrix;
        constants["viewMatrix"] = this.viewMatrix;
        constants["cameraMatrix"] = this.cameraMatrix;
        constants["cameraPosition"] = this.position;
    }
}

export {
    Camera
}