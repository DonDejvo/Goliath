import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, OrthographicCamera, TextDrawable, Mesh, ParticleSystem, Particle } = graphics;
const { Cube } = graphics.meshes;
const { vec3, quat, mat4 } = glMatrix;
const { MathUtils, LinearSpline } = math;

class RocketMesh extends Mesh {

    onInit() {
        let cnt, r1, r2, r3, y1, y2, y3, y4, y5;
        cnt = 8;
        r1 = 0.3;
        r2 = 0.15;
        r3 = 0.4;
        y1 = 1;
        y2 = 0.4;
        y3 = -0.3;
        y4 = 0.2;
        y5 = -0.5;

        const points = [];
        const faces = [];

        points.push([
            [0, y1, 0],
            [0, 0]
        ]);

        for (let i = 0; i <= cnt; ++i) {
            const a = i / cnt * Math.PI * 2;
            const c = Math.cos(a);
            const s = Math.sin(a);
            points[i + 1] = [
                [c * r1, y2, s * r1],
                [1 - i / cnt, 0]
            ];
            points[i + 1 + cnt + 1] = [
                [c * r2, y3, s * r2],
                [1 - i / cnt, 1]
            ];

            const v = 0.5 * (1 + Math.abs(i - cnt * 0.5) / cnt);

            if (i % 2 == 1) {
                const r4 = MathUtils.lerp((y4 - y3) / (y2 - y3), y3, y2);
                points[i + 2 + cnt * 2] = [
                    [c * r4, y4, s * r4],
                    [0, 1]
                ];
                points[i + 2 + cnt * 3] = [
                    [c * r3, y5, s * r3],
                    [0, 1]
                ];

                faces.push([
                    [i + 2 + cnt, i + 2 + cnt * 2, i + 2 + cnt * 3],
                    [v, 0, 0, 1]]);
            }

            if (i == cnt) {
                continue;
            }

            faces.push([
                [0, i + 1, i + 2],
                [v, 0, 0, 1]]);
            faces.push([
                [i + 1, i + 2, i + cnt + 3, i + cnt + 2],
                [v, v, v, 1]]);
        }

        const positions = [];
        const colors = [];
        const indices = [];
        const uvs = [];

        let counter = 0;

        for (let face of faces) {

            for (let pidx of face[0]) {
                const point = points[pidx];
                positions.push(...point[0]);
                colors.push(...face[1]);
                uvs.push(...point[1]);
            }

            switch (face[0].length) {
                case 3:
                    indices.push(counter,
                        counter + 1,
                        counter + 2);
                    break;
                case 4:
                    indices.push(counter,
                        counter + 1,
                        counter + 2,
                        counter,
                        counter + 2,
                        counter + 3
                    );
                    break;
            }

            counter += face[0].length;
        }
        this.bufferData(positions, 3, "positions");
        this.bufferData(colors, 4, "colors");
        this.bufferData(uvs, 2, "uvs");
        this.bufferData(indices, 0, "index");
    }

}

class Fire extends ParticleSystem {

    constructor(params) {
        super(params);

        this.camera = params.camera;
        this.parent = params.parent;
        this.accTime = 0;

        this.sizeSpline = new LinearSpline(MathUtils.lerp);
        this.sizeSpline.addPoint(0.0, 1.0);
        this.sizeSpline.addPoint(0.5, 5.0);
        this.sizeSpline.addPoint(1.0, 10.0);

        this.alphaSpline = new LinearSpline(MathUtils.lerp);
        this.alphaSpline.addPoint(0.0, 0.0);
        this.alphaSpline.addPoint(0.1, 1.0);
        this.alphaSpline.addPoint(0.6, 1.0);
        this.alphaSpline.addPoint(1.0, 0.0);

        this.colorSpline = new LinearSpline((x, a, b) => vec3.lerp(vec3.create(), a, b, x));
        this.colorSpline.addPoint(0.0, [1, 1, 0.5]);
        this.colorSpline.addPoint(1.0, [1, 0.5, 0.5]);
    }

    addParticles() {
        const delta = Gol.graphics.delta;
        this.accTime += delta;
        const n = this.accTime * 50;
        this.accTime -= n / 50;
        for (let i = 0; i < n; ++i) {
            const rotationMatrix = mat4.fromQuat(mat4.create(), this.parent.rotation);

            const radius = 1;
            const position = [
                MathUtils.rand(-1, 1) * radius,
                MathUtils.rand(-1, 1) * radius - this.parent.scale[1] * 0.4,
                MathUtils.rand(-1, 1) * radius
            ];
            vec3.transformMat4(position, position, rotationMatrix);
            vec3.add(position, position, this.parent.position);

            const velocity = [0, -15, 0];
            vec3.transformMat4(velocity, velocity, rotationMatrix);

            const params = {
                position: position,
                life: MathUtils.rand(500, 2000),
                velocity: velocity,
                color: [1, 1, 1],
                size: MathUtils.rand(2, 4)
            };
            this.particles.push(new Particle(params));
        }
    }

    updateParticles() {
        const delta = Gol.graphics.delta;
        for (let p of this.particles) {
            p.update();
        }
        this.particles = this.particles.filter(p => p.life > 0);
        for (let p of this.particles) {
            const t = 1.0 - p.life / p.maxLife;
            p.size = p.baseSize * this.sizeSpline.getValue(t);
            p.alpha = this.alphaSpline.getValue(t);
            vec3.copy(p.color, this.colorSpline.getValue(t));
            vec3.scaleAndAdd(p.position, p.position, p.velocity, delta);
            const drag = vec3.clone(p.velocity);
            vec3.scale(drag, drag, delta * 0.1);
            drag[1] = Math.sign(p.velocity[1]) * Math.min(Math.abs(drag[1]), Math.abs(p.velocity[1]));
            vec3.sub(p.velocity, p.velocity, drag);
        }

        this.particles.sort((a, b) => {
            const d1 = vec3.dist(this.camera.position, a.position);
            const d2 = vec3.dist(this.camera.position, b.position);
            return d2 - d1;
        });
    }
}

class Rocket {

    constructor(game) {
        this.game = game;
        this.drawable = new Drawable(
            new RocketMesh(),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            game.rocketTexture
        );
        vec3.set(this.drawable.scale, 7.5, 10, 7.5);

        this.fire = new Fire({
            texture: game.fireTexture,
            camera: game.camera,
            parent: this.drawable
        });

        this.rotX = 0;
        this.rotY = 0;
        this.rotZ = 0;
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

    draw(constants) {
        this.fire.update();
        quat.fromEuler(this.rotation, this.rotX, this.rotY, this.rotZ);

        this.drawable.draw(constants);

        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.ONE, Gol.gl.ONE);
        this.fire.draw(constants);
        Gol.gl.disable(Gol.gl.BLEND);
    }

}

class MainScreen extends Screen {

    constructor(game) {
        super();
        this.game = game;
        this.uiCamera = game.uiCamera;
    }

    show() {
        this.spaceTexture = new Texture(Gol.files.get("space"), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });
        this.rocketTexture = new Texture(Gol.files.get("rocket"), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });
        this.fireTexture = new Texture(Gol.files.get("fire"), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });

        this.camera = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 1000);
        vec3.set(this.camera.position, 0, 0, 35);
        this.camera.lookAt(0, -5, 0);

        this.background = new Drawable(
            new Cube({
                textureFaces: "skybox",
                textureError: 0.00075,
                width: 1000,
                height: 1000,
                depth: 1000
            }),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            this.spaceTexture
        );

        this.rocket = new Rocket(this);

        this.textFps = new TextDrawable(Gol.graphics.getFont("Consolas"));
        this.textFps.position[0] = 8;
        this.textFps.position[1] = this.uiCamera.viewportHeight - 16;
        this.textFps.scale[0] = 24;
        this.textFps.scale[1] = 24;
    }

    resize(width, height) {
        this.camera.viewportWidth = width;
        this.camera.viewportHeight = height;
        this.camera.updateProjection();
        this.rocket.fire.resize(height);
    }

    render(delta) {
        const constants = {
            ambientColor: [1, 1, 1]
        };

        this.camera.updateConstants(constants);

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);
        Gol.gl.clearColor(0, 0, 0, 1);
        Gol.gl.enable(Gol.gl.DEPTH_TEST);
        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        vec3.copy(this.background.position, this.camera.position);
        this.background.draw(constants);

        if(Gol.input.isMousePressed()) {
            this.rocket.rotZ -= Gol.input.getDeltaX() * 0.5;
            this.rocket.rotX -= Gol.input.getDeltaY() * 0.5;
        }
        this.rocket.draw(constants);

        const uiConstants = {
            ambientColor: [1, 1, 1]
        };
        this.uiCamera.updateConstants(uiConstants);

        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.ONE, Gol.gl.ONE);

        this.textFps.setText("FPS: " + Gol.graphics.fps);
        this.textFps.draw(uiConstants);

        Gol.gl.disable(Gol.gl.BLEND);
    }

}

class IntroScreen extends Screen {

    constructor(game) {
        super();
        this.game = game;
        this.uiCamera = game.uiCamera;
    }

    show() {
        this.introText = new TextDrawable(Gol.graphics.getFont("Consolas"), {
            text: "Swipe to rotate rocket",
            align: "center"
        });
        this.introText.position[0] = this.uiCamera.viewportWidth / 2;
        this.introText.position[1] = this.uiCamera.viewportHeight / 2;
        this.introText.scale[0] = 20;
        this.introText.scale[1] = 20;

        setTimeout(() => {
            this.game.setScreen(new MainScreen(this.game));
        }, 2000);
    }

    render(delta) {

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);
        Gol.gl.clearColor(0, 0, 0, 1);
        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT);

        const uiConstants = {
            ambientColor: [1, 1, 1]
        };
        this.uiCamera.updateConstants(uiConstants);

        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.ONE, Gol.gl.ONE);

        this.introText.draw(uiConstants);

    }

}

class RocketDemo extends Game {

    preload() {
        Gol.files.loadImage("space", "../boids/assets/space_m.jpg");
        Gol.files.loadImage("rocket", "assets/rocket69.png");
        Gol.files.loadImage("fire", "assets/fire.png");
    }

    create() {

        this.uiCamera = new OrthographicCamera(360, 480);

        this.setScreen(new IntroScreen(this));
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new RocketDemo()));