import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, Sprite, OrthographicCamera, Mesh, Batch, Shader, ParticleSystem, Particle } = graphics;
const { Cube, Sphere, Quad, Plane } = graphics.meshes;
const { vec2, vec3, vec4, quat } = glMatrix;
const { MathUtils, LinearSpline } = math;

class MainScreen extends Screen {

    show() {
        this.totalTime = 0;

        this.grassTexture = new Texture(Gol.files.get("grass"), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });
        this.flowersTexture = new Texture(Gol.files.get("flowers"), {
            filter: Gol.gl.NEAREST_MIPMAP_LINEAR
        });

        this.mainCamera = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 1000);
        this.mainCamera.position[1] = 8;
        this.mainCamera.position[2] = 0;


        const planeWidth = 420;
        const planeDepth = 420;
        const widthSegments = 48;
        const depthSegments = 48;
        this.plane = new Drawable(
            new Plane({
                width: planeWidth,
                depth: planeDepth,
                widthSegments: widthSegments,
                depthSegments: depthSegments,
                textureRepeat: true
            }),
            new ShaderInstance(Shader.create(Shader.Type.TEXTURE, {
                useFog: true
            })),
            this.grassTexture
        );


        this.flowerBatch = new Batch(new ShaderInstance(Shader.create(Shader.Type.TEXTURE, {
            uniforms: [
                {
                    name: "flowerTime",
                    type: "float",
                    shader: "vert"
                }
            ],
            onCustomProcessPosition: `
            if(position.y == 4.0) {
                position.x += sin(flowerTime * 1.75) * 1.5;
            }
            `,
            useFog: true
        })));
        this.flowers = [];
        for(let i = 0; i < 3000; ++i) {
            const flower = new Sprite(this.flowersTexture,
                MathUtils.randInt(0, 7) * 128 + 0.2, MathUtils.randInt(0, 7) * 128 + 0.2,
                127.6, 127.6
            );
            flower.name = "flower";
            const pos = [MathUtils.rand(-0.5, 0.5) * planeWidth, MathUtils.rand(-0.5, 0.5) * planeDepth];
            flower.position[0] = pos[0];
            flower.position[2] = pos[1];
            flower.position[1] = 2;
            flower.scale[0] = 4;
            flower.scale[1] = 4;
            this.flowers.push(flower);
        }

        for(let i = 0; i < 400; ++i) {
            const tree = new Sprite(this.flowersTexture,
                1024.2, 0.2,
                1023.6, 1023.6);
            const pos = [MathUtils.rand(-0.5, 0.5) * planeWidth, MathUtils.rand(-0.5, 0.5) * planeDepth];
            tree.position[0] = pos[0];
            tree.position[2] = pos[1];
            const scale = MathUtils.rand(16, 28);
            tree.position[1] = scale * 0.5;
            tree.scale[0] = scale;
            tree.scale[1] = scale;
            this.flowers.push(tree);
        }

    }

    resize(width, height) {
        this.mainCamera.viewportWidth = width;
        this.mainCamera.viewportHeight = height;
        this.mainCamera.updateProjection();
    }

    render(delta) {

        this.totalTime += delta;
        this.mainCamera.position[0] += delta * 2;
        vec3.rotateY(this.mainCamera.direction, this.mainCamera.direction, [0, 1, 0], delta * 0.25);

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);

        Gol.gl.clearColor(0.95, 0.95, 1, 1);
        Gol.gl.enable(Gol.gl.DEPTH_TEST);

        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        const constants = {
            ambientColor: [1, 1, 1],
            flowerTime: this.totalTime,
            fogNear: 0,
            fogFar: 100,
            fogColor: [0.95, 0.95, 1]
        };

        this.mainCamera.updateConstants(constants);

        this.plane.draw(constants);

        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.SRC_ALPHA, Gol.gl.ONE_MINUS_SRC_ALPHA);

        this.flowers.sort((a, b) => vec3.sqrDist(b.position, this.mainCamera.position) - vec3.sqrDist(a.position, this.mainCamera.position));
        this.flowerBatch.setConstants(constants);
        this.flowerBatch.begin();
        for(let flower of this.flowers) {
            quat.fromEuler(flower.rotation, 0, Math.atan2(flower.position[0] - this.mainCamera.position[0], flower.position[2] - this.mainCamera.position[2]) / Math.PI * 180, 0);
            this.flowerBatch.draw(flower);
        }
        this.flowerBatch.end();

        Gol.gl.disable(Gol.gl.BLEND);

    }

}

class TerrainDemo extends Game {

    preload() {
        Gol.files.loadImage("grass", "assets/Grass_01.png");
        Gol.files.loadImage("flowers", "../shared/assets/n_grass_atlas.png");
    }

    create() {
        this.setScreen(new MainScreen());
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new TerrainDemo()));