import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, Sprite, OrthographicCamera, Mesh, Batch, Shader, ParticleSystem, Particle } = graphics;
const { Cube, Sphere, Quad, Cone } = graphics.meshes;
const { vec2, vec3, vec4, quat, mat3, mat4 } = glMatrix;
const { MathUtils, LinearSpline } = math;

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [r, g, b];
}

class VisibilityGrid {

    constructor(bounds, dimensions) {
        this.bounds = bounds;
        this.dimensions = dimensions;
        const [x, z] = dimensions;
        this.cells = [...new Array(z)].map(e => [...new Array(x)].map(e => new Map()));
        this.cellSize = vec2.create();
        vec2.sub(this.cellSize, bounds[1], bounds[0]);
        vec2.mul(this.cellSize, 1 / x, 1 / z);
        this.getItemPosition = (item) => {
            return [item.position[0], item.position[2]];
        }
    }

    updateItem(id, item, prev = null) {
        const [x, z] = this.getCellIndex(this.getItemPosition(item));
        if(prev) {
            const [prevX, prevZ] = prev;
            if(prevX == x && prevZ == z) {
                return [prevX, prevZ];
            }
            this.cells[prevZ][prevX].delete(id);
        }
        if(x < 0 || x >= this.dimensions[0] || z < 0 || z >= this.dimensions[1]) return null; 
        this.cells[z][x].set(id, item);
        return [x, z];
    }

    getItems(position, radius) {
        const [x1, z1] = this.getCellIndex(vec2.sub(vec2.create(), position, [radius, radius]));
        const [x2, z2] = this.getCellIndex(vec2.add(vec2.create(), position, [radius, radius]));
        const items = new Set();
        for(let z = Math.max(z1, 0); z <= Math.min(z2, this.dimensions[1] - 1); ++z) {
            for(let x = Math.max(x1, 0); x <= Math.min(x2, this.dimensions[0] - 1); ++x) {
                this.cells[z][x].forEach(item => {
                        if(vec2.dist(position, this.getItemPosition(item)) <= radius) {
                            items.add(item);
                        }
                    }); 
            }
        }
        return Array.from(items);
    }

    getCellIndex(position) {
        const x = MathUtils.step(this.bounds[0][0], this.bounds[1][0], position[0]);
        const z = MathUtils.step(this.bounds[0][1], this.bounds[1][1], position[1]);

        const xIndex = Math.floor(x * (this.dimensions[0] - 1));
        const zIndex = Math.floor(z * (this.dimensions[1] - 1));
        return [xIndex, zIndex];
    }
}

class Boid {

    static SPEED = 25;
    static ACCELERATION = this.SPEED / 2.5;
    static MAX_STEERING_FORCE = this.ACCELERATION / 20;
    static WANDER_FORCE = 5;
    static SEPARATION_FORCE = 20;
    static COHESION_FORCE = 5;
    static ALIGNMENT_FORCE = 10;

    static ids = 0;

    constructor(game, params) {

        this.game = game;
        this.params = params;

        this.id = ++Boid.ids;

        const colorSpline = new LinearSpline((x, a, b) => vec4.lerp(vec4.create(), a, b, x));
        colorSpline.addPoint(0, [1, 1, 1, 1]);
        colorSpline.addPoint(0.5, [0, 0, 0, 1]);
        colorSpline.addPoint(1, [1, 1, 1, 1]);
        this.drawable = new Drawable(
            /*new SpaceshipMesh({
                colors: colorSpline,
                widthSegments: 64
            }),*/
            /*new Cube({
                colors: [...new Array(6)].map((e, i) => {
                    if(i == 1) {
                        return [1, 0, 0, 1];
                    }
                    const v = 1 - i * 0.1;
                    return [v, v, v, 1];
                })
            }),*/
            new Cone({
                colors: colorSpline,
                widthSegments: 64
            }),
            new ShaderInstance(Gol.graphics.getShader("simple")),
            null
        );

        this.drawable.shader.setUniform("ambientColor", hslToRgb(Math.random(), 1, 0.5));

        vec3.set(this.position,
            MathUtils.rand(-1, 1) * 250,
            MathUtils.rand(-1, 1) * 250,
            MathUtils.rand(-1, 1) * 250,
        );
        
        vec3.set(
            this.scale,
            3,
            4, 
            3
        );

        this.maxSteeringForce = params.maxSteeringForce;

        this.maxSpeed = params.speed;

        this.acceleration = params.acceleration;

        this.direction = [
            MathUtils.rand(-1, 1),
            MathUtils.rand(-1, 1),
            MathUtils.rand(-1, 1)
        ];

        this.velocity = vec3.clone(this.direction);

        this.wanderAngle1 = 0;

        this.visibilityIndex = game.visibilityGrid.updateItem(this.id, this);

        this.radius = 3;

        this.destination = [
            MathUtils.rand(-1, 1) * 250,
            MathUtils.rand(-1, 1) * 250,
            MathUtils.rand(-1, 1) * 250,
        ];
        this.counter = 0;
        this.destinationChangeDelay = 2500;
    }

    get position() {
        return this.drawable.position;
    }

    get rotation() {
        return this.drawable.rotation;
    }

    get scale() {
        return this.drawable.scale;
    }

    applyWander(delta) {
        this.counter += delta * 1000;
        if(this.counter >= this.destinationChangeDelay) {
            this.destinationChangeDelay = MathUtils.randInt(1000, 4000);
            this.counter = 0;
            this.destination = [
                MathUtils.rand(-1, 1) * 100,
                MathUtils.rand(-1, 1) * 100,
                MathUtils.rand(-1, 1) * 100,
            ];
        }
        this.wanderAngle1 += MathUtils.rand(-1, 1) * 0.2 * Math.PI;
        const sin1 = Math.sin(this.wanderAngle1);
        const cos1 = Math.cos(this.wanderAngle1);
        const randomPoint = [
            cos1,
            0,
            sin1
        ];
        //vec3.copy(randomPoint, this.destination);
        vec3.normalize(randomPoint, randomPoint);
        const pointAhead = vec3.clone(this.direction);
        vec3.scale(pointAhead, pointAhead, 5);
        vec3.add(pointAhead, pointAhead, randomPoint/*vec3.lerp(vec3.create(), randomPoint, pointAhead, 2 * delta)*/);
        vec3.normalize(pointAhead, pointAhead);
        return vec3.scale(pointAhead, pointAhead, Boid.WANDER_FORCE);
    }

    applySeparation(nearby) {
        const forceVector = [0, 0, 0];
        for(let e of nearby) {
            const dist = Math.max(vec3.dist(this.position, e.position) - (this.radius + e.radius), 0.001);
            const directionFromEntity = vec3.sub(vec3.create(), this.position, e.position);
            vec3.normalize(directionFromEntity, directionFromEntity);
            vec3.scale(directionFromEntity, directionFromEntity, Boid.SEPARATION_FORCE / dist);
            vec3.add(forceVector, forceVector, directionFromEntity);
        }
        return forceVector;
    }

    applyCohesion(nearby) {
        const forceVector = [0, 0, 0];
        if(nearby.length == 0) {
            return forceVector;
        }
        const averagePosition = [0, 0, 0];
        for(let e of nearby) {
            vec3.add(averagePosition, averagePosition, e.position);
        }
        vec3.scale(averagePosition, averagePosition, 1 / nearby.length);
        const directionToAvgPosition = vec3.sub(vec3.create(), averagePosition, this.position);
        vec3.normalize(directionToAvgPosition, directionToAvgPosition);
        vec3.scale(directionToAvgPosition, directionToAvgPosition, Boid.COHESION_FORCE);
        vec3.normalize(forceVector, forceVector);
        vec3.scale(forceVector, forceVector, Boid.ALIGNMENT_FORCE);
        directionToAvgPosition.y = 0;
        return directionToAvgPosition;
    }

    applyAlignment(nearby) {
        const forceVector = [0, 0, 0];
        for(let e of nearby) {
            vec3.add(forceVector, forceVector, e.direction);
        }
        vec3.normalize(forceVector, forceVector);
        vec3.scale(forceVector, forceVector, Boid.ALIGNMENT_FORCE);
        return forceVector;
    }

    applySteering(delta) {

        const nearby = this.game.visibilityGrid.getItems([this.position[0], this.position[2]], 15).filter(e => e != this && vec3.dist(e.position, this.position) > 0.001);

        this.fireCooldown -= delta * 1000;
        if(this.fireCooldown <= 0) {
            this.fireCooldown = 250;
            this.fire();
        }

        const wanderVelocity = this.applyWander(delta);
        const separationVelocity = this.applySeparation(nearby);
        const cohesionVelocity = this.applyCohesion(nearby);
        const alignmentVelocity = this.applyAlignment(nearby);

        const steeringForce = [0, 0, 0];
        vec3.add(steeringForce, steeringForce, wanderVelocity);
        vec3.add(steeringForce, steeringForce, separationVelocity);
        vec3.add(steeringForce, steeringForce, cohesionVelocity);
        vec3.add(steeringForce, steeringForce, alignmentVelocity);

        vec3.scale(steeringForce, steeringForce, 1 * this.acceleration * delta);

        if(vec3.len(steeringForce) > this.maxSteeringForce) {
            vec3.normalize(steeringForce, steeringForce);
            vec3.scale(steeringForce, steeringForce, this.maxSteeringForce);
        }

        vec3.add(this.velocity, this.velocity, steeringForce);

        if(vec3.len(this.velocity) > this.maxSpeed) {
            vec3.normalize(this.velocity, this.velocity);
            vec3.scale(this.velocity, this.velocity, this.maxSpeed);
        }

        vec3.copy(this.direction, this.velocity);
        vec3.normalize(this.direction, this.direction);
    }

    update(delta) {

        this.applySteering(delta);

        vec3.scaleAndAdd(this.position, this.position, this.velocity, delta);

        const m0 = mat4.fromXRotation(mat4.create(), Math.PI * -0.5);
        const m = mat4.create();
        mat4.lookAt(
            m,
            [0, 0, 0],
            this.direction,
            [0, 1, 0]
        );
        mat4.invert(m, m);
        mat4.mul(m, m, m0)
        quat.fromMat3(this.rotation, mat3.fromMat4(mat3.create(), m));

        this.visibilityIndex = this.game.visibilityGrid.updateItem(this.id, this, this.visibilityIndex);
    }

    draw(constants) {
        this.drawable.draw(constants);
    }

}

class BoidsDemo extends Game {

    preload() {
        Gol.files.loadImage("space", "assets/space.jpg");
    }

    create() {
        this.spaceTexture = new Texture(Gol.files.get("space"), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });

        this.camera = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 1000);

        this.background = new Drawable(
            new Cube({
                textureFaces: "skybox",
                textureError: 0.0007,
                width: 1000,
                height: 1000,
                depth: 1000
            }),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            this.spaceTexture
        );

        this.visibilityGrid = new VisibilityGrid(
            [[-300, -300], [300, 300]],
            [30, 30]
        );

        this.boids = [];
        const params = {
            speed: Boid.SPEED,
            maxSteeringForce: Boid.MAX_STEERING_FORCE,
            acceleration: Boid.ACCELERATION
        };
        for(let i = 0; i < 300; ++i) {
            const boid = new Boid(this, params);
            this.boids.push(boid);
        }

        
    }

    resize(width, height) {
        this.camera.viewportWidth = width;
        this.camera.viewportHeight = height;
        this.camera.updateProjection();
    }

    render(delta) {
        const constants = {};
        constants.ambientColor = [1, 1, 1];

        vec3.rotateY(this.camera.direction, this.camera.direction, [0, 1, 0], -0.1 * delta);
        this.camera.updateConstants(constants);

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);

        Gol.gl.clearColor(1, 1, 1, 1);

        Gol.gl.enable(Gol.gl.DEPTH_TEST);

        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        vec3.copy(this.background.position, this.camera.position);
        this.background.draw(constants);

        for(let boid of this.boids) {
            boid.update(delta);
            boid.draw(constants);
        }

        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.ONE, Gol.gl.ONE_MINUS_SRC_ALPHA);

        Gol.gl.disable(Gol.gl.BLEND);
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new BoidsDemo()));