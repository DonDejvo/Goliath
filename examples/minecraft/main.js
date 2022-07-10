import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, ShaderInstance, Texture, PerspectiveCamera, Sprite, OrthographicCamera, Mesh, Batch, Shader } = graphics;
const { Cube, Sphere, Quad } = graphics.meshes;
const { vec2, vec3, vec4 } = glMatrix;
const { MathUtils, LinearSpline } = math;

class ControlsRenderer {

    constructor() {

        this.dpadTexture = new Texture(Gol.files.get("controls"));

        this.camera = new OrthographicCamera(240, 360);

        this.dpad = new Sprite(
            this.dpadTexture,
            0, 64,
            128, 128
        );
        this.dpad.position[0] = 64;
        this.dpad.position[1] = 64;
        this.dpad.scale[0] = 128;
        this.dpad.scale[1] = 128;

        this.btnUp = new Sprite(
            this.dpadTexture,
            128, 0,
            64, 64
        );
        this.btnUp.position[0] = this.camera.viewportWidth - 32;
        this.btnUp.position[1] = 32;
        this.btnUp.scale[0] = 64;
        this.btnUp.scale[1] = 64;

    }

    render() {

        Gol.gl.disable(Gol.gl.DEPTH_TEST);
        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.SRC_ALPHA, Gol.gl.ONE_MINUS_SRC_ALPHA);

        const constants = {
            ambientColor: [1, 1, 1]
        };

        this.camera.updateConstants(constants);

        if (Gol.device.type == "mobile") {

            this.dpad.draw(constants);
            this.btnUp.draw(constants);

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
        Gol.audio.playBgMusic("soundtrack");

        this.totalTime = 0;

        this.mouse = { x: 0, y: 0, idx: -1 };
        this.blocks = [];
        this.movingUp = false;
        this.transparentBlocks = [];

        this.controlsRenderer = new ControlsRenderer();

        this.mainCamera = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 2000);
        this.mainCamera.position[1] = 2;
        this.mainCamera.position[2] = 8;

        this.fogSimpleShader = Shader.create(Shader.Type.SIMPLE, { useFog: true });
        this.fogTextureShader = Shader.create(Shader.Type.TEXTURE, { useFog: true });

        this.grassTexture = new Texture(Gol.files.get("grass"), { filter: Gol.gl.NEAREST });
        this.dirtTexture = new Texture(Gol.files.get("dirt"), { filter: Gol.gl.NEAREST });
        this.stoneTexture = new Texture(Gol.files.get("cobblestone"), { filter: Gol.gl.NEAREST });
        this.woodTexture = new Texture(Gol.files.get("snakewood"), { filter: Gol.gl.NEAREST });
        this.leavesTexture = new Texture(Gol.files.get("leaves"), { filter: Gol.gl.NEAREST });

        this.treeBatch = new Drawable(
            new Mesh(),
            new ShaderInstance(this.fogTextureShader),
            this.leavesTexture
        );

        const cube = new Cube({
            textureFaces: "single",
            colors: [...new Array(6)].map((elem, idx) => {
                const v = 1 - 0.05 * idx;
                return [v, v, v, 1.0];
            })
        });

        const blocks = [];

        this.createSky();
        this.createGround();
        this.createHouse(0, -4);

        blocks.push(...this.createTree(10, 0, 6));
        blocks.push(...this.createTree(6, 5, 5));
        blocks.push(...this.createTree(7, -12, 8));
        blocks.push(...this.createTree(-7, 8, 7));
        blocks.push(...this.createTree(-8, -4, 6));

        const positions = [];
        const uvs = [];
        const colors = [];
        const indices = [];

        let indexOffset = 0;

        const positionBuffer = cube.buffers.get("positions");
        const uvBuffer = cube.buffers.get("uvs");
        const colorBuffer = cube.buffers.get("colors");
        const indexBuffer = cube.buffers.get("index");

        for(let block of blocks) {
            positions.push(...positionBuffer.data.map((elem, idx) => elem + block[idx % 3]));
            colors.push(...colorBuffer.data);
            indices.push(...indexBuffer.data.map((elem, idx) => elem + indexOffset / 6 * 4));
            uvs.push(...uvBuffer.data);

            indexOffset += indexBuffer.data.length;
        }

        this.treeBatch.mesh.bufferData(positions, 3, "positions");
        this.treeBatch.mesh.bufferData(colors, 4, "colors");
        this.treeBatch.mesh.bufferData(uvs, 2, "uvs");
        this.treeBatch.mesh.bufferData(indices, 0, "index");

        this.clouds = [];
        this.createCloud(-2, 24, -8, 6, 1, 4);
        this.createCloud(8, 28, 0, 4, 1, 5);
        this.createCloud(-6, 24, 5, 8, 1, 3);
        this.createCloud(0, 28, 7, 3, 1, 6);

        this.cloudBatch = new Batch(new ShaderInstance(this.fogSimpleShader));
        this.spriteBatch = new Batch(new ShaderInstance(this.fogTextureShader));

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

    createCloud(x, y, z, width, height, depth) {
        const cloud = new Drawable(
            new Cube({
                colors: [
                    [1, 1, 1, 0.25]
                ],
                width: width,
                height: height,
                depth: depth
            }),
            new ShaderInstance(this.fogSimpleShader),
            null
        );
        vec3.set(cloud.position, x, y, z);
        this.clouds.push(cloud);
    }

    createTree(x, z, height) {

        const position = [x, 0, z];
        const radius = 3;
        const brightness = MathUtils.rand(0.5, 1.0);

        const addBlock = (x, y, z, material = "wood") => {

            let tex;
            switch (material) {
                case "wood":
                    tex = this.woodTexture;
                    break;
                case "leaves":
                    tex = this.leavesTexture;
                    break;
            }

            const block = new Drawable(
                new Cube({
                    textureFaces: material == "wood" ? "multiple" : "single",
                    colors: [...new Array(6)].map((elem, idx) => {
                        const v = brightness - 0.05 * idx;
                        return [v, v, v, 1.0];
                    })
                }),
                new ShaderInstance(this.fogTextureShader),
                tex
            );
            block.matrixAutoUpdate = false;
            vec3.set(block.position,
                x,
                y,
                z);

            return block;

        }

        // trunk
        for (let y = 1; y <= height; ++y) {
            this.blocks.push(addBlock(position[0], position[1] + y, position[2]));
        }

        const treeCrown = [];

        // crown
        for (let x = -radius; x <= radius; ++x) {
            for (let z = -radius; z <= radius; ++z) {
                for (let y = -radius; y <= radius; ++y) {

                    if (
                        (((x == 0 && z == 0)) && y <= 0) ||
                        x ** 2 + y ** 2 + z ** 2 > radius ** 2 - [3.5, 3.5, 2.0, 0.5][height - 5]
                    ) {
                        continue;
                    }

                    treeCrown.push([position[0] + x, position[1] + height + y, position[2] + z]);
                    this.transparentBlocks.push(addBlock(position[0] + x, position[1] + height + y, position[2] + z, "leaves"));
                }
            }
        }

        return treeCrown;

    }

    createGround() {

        const batch = new Drawable(
            new Mesh(),
            new ShaderInstance(this.fogTextureShader),
            this.grassTexture
        );

        const cube = new Cube({
            textureFaces: "multiple",
            colors: [...new Array(6)].map((elem, idx) => {
                const v = 1 - 0.05 * idx;
                return [v, v, v, 1.0];
            })
        });

        const countX = 30, countY = 2, countZ = 30;

        const positions = [];
        const uvs = [];
        const colors = [];
        const indices = [];

        let indexOffset = 0;

        const positionBuffer = cube.buffers.get("positions");
        const uvBuffer = cube.buffers.get("uvs");
        const colorBuffer = cube.buffers.get("colors");
        const indexBuffer = cube.buffers.get("index");

        for (let x = 0; x < countX; ++x) {
            for (let z = 0; z < countZ; ++z) {
                for (let y = 0; y < countY; ++y) {

                    const position = [
                        x - Math.floor(countX * 0.5),
                        -y,
                        z - Math.floor(countZ * 0.5)
                    ];

                    positions.push(...positionBuffer.data.map((elem, idx) => elem + position[idx % 3]));
                    colors.push(...colorBuffer.data);
                    indices.push(...indexBuffer.data.map((elem, idx) => elem + indexOffset / 6 * 4));

                    if (y == 0) {

                        uvs.push(...uvBuffer.data);

                    } else {

                        const sx = 0.25, sy = 0.5, sw = 0.25, sh = 0.5;

                        for (let i = 0; i < 6; ++i) {
                            uvs.push(
                                sx, sy,
                                sx + sw, sy,
                                sx + sw, sy + sh,
                                sx, sy + sh
                            );
                        }

                    }

                    indexOffset += indexBuffer.data.length;

                }
            }
        }

        batch.mesh.bufferData(positions, 3, "positions");
        batch.mesh.bufferData(colors, 4, "colors");
        batch.mesh.bufferData(uvs, 2, "uvs");
        batch.mesh.bufferData(indices, 0, "index");

        this.blocks.push(batch);
    }

    createHouse(x, z) {

        const position = [x, 0, z];
        const width = 6, height = 3, depth = 6;

        const addBlock = (x, y, z, material = "stone") => {

            let tex;
            switch (material) {
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
                new ShaderInstance(this.fogTextureShader),
                tex
            );
            block.matrixAutoUpdate = false;
            vec3.set(block.position,
                x,
                y,
                z);

            this.blocks.push(block);

        }

        for (let y = 1; y <= height; ++y) {

            // front wall
            for (let x = 0; x < width; ++x) {
                if (x == Math.floor(width * 0.5) && y <= 2) {
                    continue;
                }
                addBlock(x + position[0] - Math.floor(width * 0.5), y + position[1], position[2] + Math.floor(depth * 0.5));
            }

            // back wall
            for (let x = 0; x < width; ++x) {
                addBlock(x + position[0] - Math.floor(width * 0.5), y + position[1], position[2] - Math.floor(depth * 0.5));
            }

            // left wall
            for (let z = 1; z < depth; ++z) {
                if (z == Math.floor(depth * 0.5) && y == 2) {
                    continue;
                }
                addBlock(position[0] - Math.floor(width * 0.5), y + position[1], z + position[2] - Math.floor(depth * 0.5));
            }

            // right wall
            for (let z = 0; z <= depth; ++z) {
                if (z == Math.floor(depth * 0.5) && y == 2) {
                    continue;
                }
                addBlock(position[0] + Math.floor(width * 0.5), y + position[1], z + position[2] - Math.floor(depth * 0.5));
            }

        }

        // roof
        for (let x = 0; x <= width; ++x) {
            for (let z = 0; z <= depth; ++z) {
                addBlock(position[0] + x - Math.floor(width * 0.5), height + 1, z + position[2] - Math.floor(depth * 0.5), "wood");
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

    handleInput() {

        const handleSwipe = (x, y) => {
            vec3.rotateY(this.mainCamera.direction, this.mainCamera.direction, this.mainCamera.up, (this.mouse.x - x) * 0.005);
            this.mainCamera.direction[1] = MathUtils.clamp(this.mainCamera.direction[1] + (y - this.mouse.y) * 0.005, -2, 2);
            this.mouse.x = x;
            this.mouse.y = y;
        }

        if (Gol.device.type == "mobile") {

            const dpad = this.controlsRenderer.dpad;
            const btnUp = this.controlsRenderer.btnUp;

            const ratio = [
                Gol.graphics.width / this.controlsRenderer.camera.viewportWidth,
                Gol.graphics.height / this.controlsRenderer.camera.viewportHeight
            ];

            const handleDPad = (x, y) => {

                const v = [
                    x / ratio[0] - dpad.position[0],
                    y / ratio[1] - dpad.position[1]
                ];

                if (Math.abs(v[0]) < 64 && Math.abs(v[1]) < 64) {
                    const angle = Math.atan2(v[1], v[0]) - Math.PI / 2;

                    const translation = vec3.create();

                    vec3.rotateY(translation, this.mainCamera.direction, this.mainCamera.up, angle);
                    vec3.scaleAndAdd(this.mainCamera.position, this.mainCamera.position, translation, Gol.graphics.delta * 5);
                }

            }

            if(this.mouse.idx != -1 && !Gol.input.isTouched(this.mouse.idx)) {
                this.mouse.idx = -1;
            }

            this.movingUp = false;

            for(let i = 0; i < 2; ++i) {
                if (Gol.input.isTouched(i)) {

                    const x = Gol.input.getX(i);
                    const y = Gol.input.getY(i);
    
                    handleDPad(x, y);
    
                    if(x > Gol.graphics.width / 2) {

                        if(Gol.input.isJustTouched(i)) {
                            this.mouse.x = x;
                            this.mouse.y = y;
                            this.mouse.idx = i;
                        }

                        if(this.mouse.idx == i) {
                            handleSwipe(x, y);
                        }
                    }

                    this.movingUp = x / ratio[0] > this.controlsRenderer.camera.viewportWidth - btnUp.scale[0] && 
                        y / ratio[1] < btnUp.scale[1];
    
                }
            }

        } else {

            if(Gol.input.isMousePressed()) {

                const x = Gol.input.getX();
                const y = Gol.input.getY();

                if(Gol.input.isMouseClicked()) {
                    this.mouse.x = x;
                    this.mouse.y = y;
                }

                handleSwipe(x, y);
            }

            const translation = vec3.create();

            if (Gol.input.isKeyPressed("KeyW")) {
                const front = this.mainCamera.direction;
                vec3.add(translation, translation, [front[0], 0, front[2]]);
            }

            if (Gol.input.isKeyPressed("KeyS")) {
                const front = this.mainCamera.direction;
                vec3.add(translation, translation, [-front[0], 0, -front[2]]);
            }

            if (Gol.input.isKeyPressed("KeyA")) {
                const right = this.mainCamera.getRight();
                vec3.add(translation, translation, [-right[0], 0, -right[2]]);
            }

            if (Gol.input.isKeyPressed("KeyD")) {
                const right = this.mainCamera.getRight();
                vec3.add(translation, translation, [right[0], 0, right[2]]);
            }

            vec3.normalize(translation, translation);
            vec3.scaleAndAdd(this.mainCamera.position, this.mainCamera.position, translation, Gol.graphics.delta * 5);

            this.movingUp = Gol.input.isKeyPressed("Space");
        }
    }

    render(delta) {

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);

        Gol.gl.clearColor(0.2, 0.2, 0.2, 1.0);
        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        this.handleInput();

        if(this.movingUp) {
            this.mainCamera.position[1] += 3 * delta;
        } else {
            this.mainCamera.position[1] -= 3 * delta;
        }

        if (this.mainCamera.position[1] < 2) {
            this.mainCamera.position[1] = 2;
        }

        this.drawScene();

        this.controlsRenderer.render();

    }

    drawScene() {

        this.totalTime += Gol.graphics.delta;

        const constants = {
            ambientColor: [1, 1, 1],
            fogNear: 0,
            fogFar: 30,
            fogColor: [0.8, 0.9, 1.0],
            fogTime: this.totalTime,
        };



        this.mainCamera.updateConstants(constants);

        Gol.gl.enable(Gol.gl.DEPTH_TEST);
        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.SRC_ALPHA, Gol.gl.ONE_MINUS_SRC_ALPHA);

        this.sky.draw(constants);

        this.spriteBatch.setConstants(constants);
        this.transparentBlocks.sort((b1, b2) => vec3.sqrDist(b2.position, this.mainCamera.position) - vec3.sqrDist(b1.position, this.mainCamera.position));
        this.spriteBatch.begin();
        for (let block of this.blocks) {
            this.spriteBatch.draw(block);
        }
        this.spriteBatch.end();

        for(let block of this.transparentBlocks) {
            block.draw(constants);
        }

        this.cloudBatch.setConstants(constants);
        this.cloudBatch.begin();
        for(let cloud of this.clouds) {
            this.cloudBatch.draw(cloud);
            //cloud.draw(constants);
        }
        this.cloudBatch.end();

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
        Gol.files.loadAudio("soundtrack", "../shared/assets/code-geass-for-you.mp3");
    }

    create() {
        this.setScreen(new MainScreen(this));
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new MinecraftDemo()));