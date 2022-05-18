import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, Sprite, OrthographicCamera, Mesh } = graphics;
const { Cube, Sphere, Quad } = graphics.meshes;
const { vec3, vec4 } = glMatrix;
const { MathUtils, LinearSpline } = math;

class ControlsRenderer {

    constructor() {

        this.dpadTexture = new Texture(Gol.files.get("controls"));

        this.camera = new OrthographicCamera(640, 480);

        this.dpad = new Sprite(
            this.dpadTexture,
            0, 64,
            128, 128
        );
        this.dpad.position[0] = 78;
        this.dpad.position[1] = 78;
        this.dpad.scale[0] = 128;
        this.dpad.scale[1] = 128;

    }

    render() {

        Gol.gl.disable(Gol.gl.DEPTH_TEST);
        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.SRC_ALPHA, Gol.gl.ONE_MINUS_SRC_ALPHA);

        const constants = {
            ambientColor: [1, 1, 1]
        };

        this.camera.updateConstants(constants);

        if(Gol.device.type == "mobile" || true) {

            this.dpad.draw(constants);

        }
    }

    dispose() {

        this.dpadTexture.dispose();
    
    }

}

class MainScreen extends Screen {

    constructor(game) {
        super();

        this.game = game;
    }

    show() {

        this.mouse = { x: 0, y: 0 };
        this.blocks = [];

        this.controlsRenderer = new ControlsRenderer();
        
        this.mainCamera = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 2000);
        this.mainCamera.position[1] = 2.0;
        this.mainCamera.position[2] = 5.0;

        this.grassTexture = new Texture(Gol.files.get("grass"), { filter: Gol.gl.NEAREST });
        this.dirtTexture = new Texture(Gol.files.get("dirt"), { filter: Gol.gl.NEAREST });
        this.stoneTexture = new Texture(Gol.files.get("cobblestone"), { filter: Gol.gl.NEAREST });
        this.woodTexture = new Texture(Gol.files.get("snakewood"), { filter: Gol.gl.NEAREST });

        this.createSky();
        this.createGroundBatch();
        this.createHouse();

    }

    createSky() {

        const colorSpline = new LinearSpline((x, a, b) => vec4.lerp(vec4.create(), a, b, x));
        colorSpline.addPoint(0.0, [0.0, 0.5, 1.0, 1.0]);
        colorSpline.addPoint(0.5, [0.8, 0.9, 1.0, 1.0]);

        this.sky = new Drawable(
            new Sphere({
                radius: 1000,
                colors: colorSpline
            }),
            new ShaderInstance(Gol.graphics.getShader("simple")),
            null
        );
        this.sky.matrixAutoUpdate = false;
    }

    createGround() {

        const countX = 15, countZ = 15, countY = 2;

        const addBlock = (x, y, z) => {

            const block = new Drawable(
                new Cube({
                    textureFaces: y == 0 ? "multiple" : "single",
                    colors: [...new Array(6)].map((elem, idx) => {
                        const v = 1 - 0.05 * idx;
                        return [v, v, v, 1.0];
                    })
                }),
                new ShaderInstance(Gol.graphics.getShader("texture")),
                y == 0 ? this.grassTexture : this.dirtTexture
            );
            block.matrixAutoUpdate = false;
            vec3.set(block.position,
                x,
                y,
                z);

            this.blocks.push(block);

        }

        for(let x = 0; x < countX; ++x) {
            for(let z = 0; z < countZ; ++z) {

                for(let y = 0; y < countY; ++y) {
                    addBlock(
                        x - Math.floor(countX * 0.5), 
                        -y, 
                        z - Math.floor(countZ * 0.5));
                }
            }
        }

    }

    createHouse() {

        const position = [0, 0, 0];
        const width = 6, height = 3, depth = 6;

        const addBlock = (x, y, z, material = "stone") => {

            let tex;
            switch(material) {
                case "stone":
                    tex = this.stoneTexture;
                    break;
                case "wood":
                    tex = this.woodTexture;
                    break;
            }

            const block = new Drawable(
                new Cube({
                    textureFaces: material == "wood" ? "multiple" : "single",
                    colors: [...new Array(6)].map((elem, idx) => {
                        const v = 1 - 0.05 * idx;
                        return [v, v, v, 1.0];
                    })
                }),
                new ShaderInstance(Gol.graphics.getShader("texture")),
                tex
            );
            block.matrixAutoUpdate = false;
            vec3.set(block.position,
                x,
                y,
                z);

            this.blocks.push(block);

        }

        for(let y = 0; y < height; ++y) {

            // front wall
            for(let x = 0; x < width; ++x) {
                if(x == Math.floor(width * 0.5)) {
                    continue;
                }
                addBlock(x + position[0] - Math.floor(width * 0.5), y + position[1], position[2] + Math.floor(depth * 0.5));
            }

            // back wall
            for(let x = 0; x < width; ++x) {
                addBlock(x + position[0] - Math.floor(width * 0.5), y + position[1], position[2] - Math.floor(depth * 0.5));
            }

            // left wall
            for(let z = 1; z < depth; ++z) {
                addBlock(position[0] - Math.floor(width * 0.5), y + position[1], z + position[2] - Math.floor(depth * 0.5));
            }

            // right wall
            for(let z = 0; z <= depth; ++z) {
                addBlock(position[0] + Math.floor(width * 0.5), y + position[1], z + position[2] - Math.floor(depth * 0.5));
            }

        }

        // roof
        for(let x = 0; x <= width; ++x) {
            for(let z = 0; z <= depth; ++z) {
                addBlock(position[0] + x - Math.floor(width * 0.5), height, z + position[2] - Math.floor(depth * 0.5), "wood");
            }
        }

    }

    hide() {

        this.grassTexture.dispose();
        this.dirtTexture.dispose();
        this.stoneTexture.dispose();
        this.woodTexture.dispose();
        this.sky.mesh.dispose();
        this.controlsRenderer.dispose();

    }

    resize(width, height) {
        this.mainCamera.viewportWidth = width;
        this.mainCamera.viewportHeight = height;
        this.mainCamera.updateProjection();
    }

    render(delta) {

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);

        Gol.gl.clearColor(0.2, 0.2, 0.2, 1.0);
        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        const mouseX = Gol.input.getX();
        const mouseY = Gol.input.getY();

        if(mouseX > Gol.graphics.width * 0.5) {

            if(Gol.input.isMouseClicked()) {
                this.mouse.x = mouseX;
                this.mouse.y = mouseY;
            }
            if(Gol.input.isMousePressed()) {
                vec3.rotateY(this.mainCamera.direction, this.mainCamera.direction, this.mainCamera.up, (this.mouse.x - mouseX) * 0.005);
                this.mainCamera.direction[1] += (this.mouse.y - mouseY) * 0.005;
                this.mouse.x = mouseX;
                this.mouse.y = mouseY;
            }

        } else {

            const dpad = this.controlsRenderer.dpad;

            

        }

        

        const translation = vec3.create();

        if(Gol.input.isKeyPressed("KeyW")) {
            const front = this.mainCamera.direction;
            vec3.add(translation, translation, [front[0], 0, front[2]]);
        }

        if(Gol.input.isKeyPressed("KeyS")) {
            const front = this.mainCamera.direction;
            vec3.add(translation, translation, [-front[0], 0, -front[2]]);
        }

        if(Gol.input.isKeyPressed("KeyA")) {
            const right = this.mainCamera.getRight();
            vec3.add(translation, translation, [-right[0], 0, -right[2]]);
        }

        if(Gol.input.isKeyPressed("KeyD")) {
            const right = this.mainCamera.getRight();
            vec3.add(translation, translation, [right[0], 0, right[2]]);
        }

        vec3.scaleAndAdd(this.mainCamera.position, this.mainCamera.position, translation, Gol.graphics.delta * 5);

        this.drawScene();

        this.controlsRenderer.render();

    }

    drawScene() {

        const constants = {
            ambientColor: [1, 1, 1]
        };

        

        this.mainCamera.updateConstants(constants);

        Gol.gl.enable(Gol.gl.DEPTH_TEST);

        this.sky.draw(constants);

        for(let block of this.blocks) {
            block.draw(constants);
        }

    }

    createGroundBatch() {

        const batch = new Drawable(
            new Mesh(),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            this.grassTexture
        );

        const cube = new Cube({
            textureFaces: "multiple",
            colors: [...new Array(6)].map((elem, idx) => {
                const v = 1 - 0.05 * idx;
                return [v, v, v, 1.0];
            })
        });

        const countX = 25, countZ = 25;

        const positions = [];
        const uvs = [];
        const colors = [];
        const indices = [];

        let indexOffset = 0;

        const positionBuffer = cube.buffers.get("positions");
        const uvBuffer = cube.buffers.get("uvs");
        const colorBuffer = cube.buffers.get("colors");
        const indexBuffer = cube.buffers.get("index");

        for(let x = 0; x < countX; ++x) {
            for(let z = 0; z < countZ; ++z) {

                const position = [
                    x - Math.floor(countX * 0.5), 
                    0, 
                    z - Math.floor(countZ * 0.5)
                ];

                positions.push(...positionBuffer.data.map((elem, idx) => elem + position[idx % 3]));
                uvs.push(...uvBuffer.data);
                colors.push(...colorBuffer.data);
                indices.push(...indexBuffer.data.map((elem, idx) => elem + indexOffset / 6 * 4));

                indexOffset += indexBuffer.data.length;
            }
        }

        batch.mesh.bufferData(positions, 3, "positions");
        batch.mesh.bufferData(colors, 4, "colors");
        batch.mesh.bufferData(uvs, 2, "uvs");
        batch.mesh.bufferData(indices, 0, "index");

        this.blocks.push(batch);
    }

}

class MinecraftDemo extends Game {

    preload() {
        Gol.files.loadImage("grass", "assets/grass.png");
        Gol.files.loadImage("cobblestone", "assets/cobblestone.png");
        Gol.files.loadImage("dirt", "assets/dirt.png");
        Gol.files.loadImage("snakewood", "assets/snakewood.png");
        Gol.files.loadImage("leaves", "assets/leaves.png");
        Gol.files.loadImage("controls", "../shared/assets/controls.png");
    }

    create() {
        this.setScreen(new MainScreen(this));
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new MinecraftDemo()));