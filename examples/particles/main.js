import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, Sprite, OrthographicCamera, Mesh, Batch, Shader, ParticleSystem, Particle } = graphics;
const { Cube, Sphere, Quad, Plane } = graphics.meshes;
const { vec2, vec3, vec4 } = glMatrix;
const { MathUtils, LinearSpline } = math;


class Fire extends ParticleSystem {

    constructor(params) {
        super(params);

        this.camera = params.camera;
        this.position = [0, 0, 0];
        this.accTime = 0;

        this.alphaSpline = new LinearSpline(MathUtils.lerp);
        this.alphaSpline.addPoint(0, 1);
        this.alphaSpline.addPoint(1, 0);

        this.sizeSpline = new LinearSpline(MathUtils.lerp);
        this.sizeSpline.addPoint(0, 12);
        this.sizeSpline.addPoint(1, 3);

        this.velocitySpline = new LinearSpline((x, a, b) => vec3.lerp(vec3.create(), a, b, x));
        this.velocitySpline.addPoint(0, [0, 20, 0]);
        this.velocitySpline.addPoint(1, [0, 10, 0]);
    }

    createParticle() {

        const position = [
            MathUtils.rand(-1, 1) * 0.5,
            MathUtils.rand(-1, 1) * 0.5,
            MathUtils.rand(-1, 1) * 0.5
        ];
        vec3.add(position, position, this.position);

        const particle = new Particle({
            position: position,
            life: 600,
            velocity: [0, 20, 0],
        });

        this.particles.push(particle);
    }

    addParticles() {
        const time = 75;
        this.accTime += Gol.graphics.delta * 1000;
        while(this.accTime >= time) {
            this.accTime -= time;
            this.createParticle();
        } 
    }

    updateParticles() {
        for(let p of this.particles) {
            p.update();
            const t = 1 - p.life / p.maxLife;
            p.alpha = this.alphaSpline.getValue(t);
            p.size = this.sizeSpline.getValue(t);
            vec3.copy(p.velocity, this.velocitySpline.getValue(t));
            vec3.scaleAndAdd(p.position, p.position, p.velocity, Gol.graphics.delta);
        }

        this.particles = this.particles.filter(p => p.life > 0);

        this.particles.sort((p1, p2) => vec3.sqrDist(p2.position, this.camera.position) - vec3.sqrDist(p1.position, this.camera.position));
    }

}

class MainScreen extends Screen {

    show() {
        Gol.audio.playBgMusic("bg-theme");

        this.dirtTexture = new Texture(Gol.files.get("dirt"), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });

        this.flameTexture = new Texture(Gol.files.get("flameparticle"));

        this.fogTextureShader = Shader.create(Shader.Type.TEXTURE, { useFog: false });

        this.mainCamera = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 1000);
        this.mainCamera.position[1] = 5;

        this.fireplaces = [];
        for(let i = 0; i < 10; ++i) {
            const fire = new Fire({
                texture: this.flameTexture,
                camera: this.mainCamera
            });
            fire.position[0] = MathUtils.rand(-30, 30);
            fire.position[1] = 1;
            fire.position[2] = MathUtils.rand(-30, 30);
            this.fireplaces.push(fire);
        }
        this.fireplaces.sort((f1, f2) => vec3.sqrDist(f2.position, this.mainCamera.position) - vec3.sqrDist(f1.position, this.mainCamera.position));

        this.ground = new Drawable(
            new Plane({
                width: 80,
                depth: 80,
                widthSegments: 20,
                depthSegments: 20,
                textureRepeat: true,
                colors: (x, y, z) => {
                    let v = 0;
                    for(let fire of this.fireplaces) {
                        v += MathUtils.sat(1 - vec3.sqrDist(fire.position, [x, y, z]) / 12 ** 2) * 0.75;
                    }
                    return [v, v, v, 1];
                }
            }),
            new ShaderInstance(this.fogTextureShader),
            this.dirtTexture
        );
    }

    resize(width, height) {
        this.mainCamera.viewportWidth = width;
        this.mainCamera.viewportHeight = height;
        this.mainCamera.updateProjection();
        for(let fire of this.fireplaces) {
            fire.onScreenResize(width, height);
        }
    }

    render() {
        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);

        Gol.gl.clearColor(0, 0, 0, 1);
        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        Gol.gl.enable(Gol.gl.DEPTH_TEST);

        const constants = {
            ambientColor: [1, 1, 1]
        };

        vec3.rotateY(this.mainCamera.direction, this.mainCamera.direction, this.mainCamera.up, Gol.graphics.delta * 0.4);
        this.mainCamera.updateConstants(constants);

        this.ground.draw(constants);

        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.ONE, Gol.gl.ONE);
        for(let fire of this.fireplaces) {
            fire.update();
            fire.draw(constants);
        }
        Gol.gl.disable(Gol.gl.BLEND);

    }

}

class ParticlesDemo extends Game {

    preload() {
        Gol.files.loadImage("dirt", "assets/dirt.jpg");
        Gol.files.loadAudio("bg-theme", "assets/bg-theme.mp3");
        Gol.files.loadImage("flameparticle", "assets/flameparticle.png");
    }

    create() {
        this.setScreen(new MainScreen());
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new ParticlesDemo()));