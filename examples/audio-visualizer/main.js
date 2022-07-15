import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, meshes, PerspectiveCamera, ShaderInstance, Texture, Mesh } = graphics;
const { Cube, Sphere, Plane } = meshes;
const { vec2, vec3, vec4, quat } = glMatrix;
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

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

class MyMesh extends Mesh {

    onInit() {

        const halfWidth = this.options.width ? this.options.width / 2 : 0.5;
        const halfHeight = this.options.height ? this.options.height / 2 : 0.5;
        const halfDepth = this.options.depth ? this.options.depth / 2 : 0.5;

        const positions = [
            // Front face
            -halfWidth, halfHeight, halfDepth,
            halfWidth, halfHeight, halfDepth,
            halfWidth, -halfHeight, halfDepth,
            -halfWidth, -halfHeight, halfDepth,

            // Back face
            -halfWidth, halfHeight, -halfDepth,
            halfWidth, halfHeight, -halfDepth,
            halfWidth, -halfHeight, -halfDepth,
            -halfWidth, -halfHeight, -halfDepth,

            // Top face
            -halfWidth, halfHeight, -halfDepth,
            halfWidth, halfHeight, -halfDepth,
            halfWidth, halfHeight, halfDepth,
            -halfWidth, halfHeight, halfDepth,

            // Bottom face
            -halfWidth, -halfHeight, halfDepth,
            halfWidth, -halfHeight, halfDepth,
            halfWidth, -halfHeight, -halfDepth,
            -halfWidth, -halfHeight, -halfDepth,

            // Right face
            halfWidth, halfHeight, halfDepth,
            halfWidth, halfHeight, -halfDepth,
            halfWidth, -halfHeight, -halfDepth,
            halfWidth, -halfHeight, halfDepth,

            // Left face
            -halfWidth, halfHeight, -halfDepth,
            -halfWidth, halfHeight, halfDepth,
            -halfWidth, -halfHeight, halfDepth,
            -halfWidth, -halfHeight, -halfDepth,
        ];

        let textureFaces = "single";
        if (this.options.textureFaces !== undefined) {
            textureFaces = this.options.textureFaces;
        }

        const uvs = [];

        if (textureFaces == "single") {

            for (let i = 0; i < 6; ++i) {
                uvs.push(
                    0, 0,
                    1, 0,
                    1, 1,
                    0, 1
                );
            }

        } else if (textureFaces == "multiple") {

            const w = 0.25, h = 0.5;

            const add = (x, y) => {
                uvs.push(
                    x * w, y * h,
                    w * (x + 1), y * h,
                    w * (x + 1), h * (y + 1),
                    x * w, h * (y + 1)
                );
            }

            // Front face
            add(1, 0);
            // Back face
            add(3, 0);
            // Top face
            add(0, 1);
            // Bottom face
            add(1, 1);
            // Right face
            add(2, 0);
            // Left face
            add(0, 0);

        } else {
            throw new Error("options.textureFaces valid values are single or multiple");
        }

        const indices = [
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ];

        const c1 = this.options.colors[0];
        const c2 = this.options.colors[1];

        const colors = [
            // Front face
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,

            // Back face
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,
            1, 1, 1, 1,

            // Top face
            ...c2,
            ...c2,
            ...c1,
            ...c1,

            // Bottom face
            ...c1,
            ...c1,
            ...c2,
            ...c2,

            // Right face
            ...c1,
            ...c2,
            ...c2,
            ...c1,

            // Left face
            ...c2,
            ...c1,
            ...c1,
            ...c2
        ];

        this.bufferData(positions, 3, "positions");
        this.bufferData(colors, 4, "colors");
        this.bufferData(uvs, 2, "uvs");
        this.bufferData(indices, 0, "index");
    }
}

class VisualizerDemo extends Game {

    preload() {
        Gol.files.loadAudio("soundtrack", "https://raw.githubusercontent.com/DonDejvo/BlobbyVolley/main/Linkin%20Park%20-%20With%20You.mp3");
    }

    createTexture(W, H, x, y) {
        const countX = x, countY = y;
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.canvas.width = W;
        ctx.canvas.height = H;

        const grd = ctx.createLinearGradient(0, 0, W, 0);
        const cnt = 7;
        for(let i = 0; i < cnt; ++i) {
            grd.addColorStop(i / (cnt - 1), i % 2 ? "white" : "grey");
        }

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
        /*
        for (let i = 0; i < countY; ++i) {
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.moveTo(0, i / countY * H);
            ctx.lineTo(W, i / countY * H);
            ctx.stroke();
        }

        for (let i = 0; i < countX; ++i) {
            ctx.beginPath();
            ctx.strokeStyle = "black";
            ctx.moveTo(i / countX * W, 0);
            ctx.lineTo(i / countX * W, H);
            ctx.stroke();
        }
        */

        return ctx.canvas;
    }

    create() {
        this.totalTime = 0;
        this.noise = new SimplexNoise();

        Gol.audio.playBgMusic("soundtrack");
        Gol.audio.setFrequencyDataSize(512);
        this.cam = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 1000);
        this.cam.position[2] = 100;

        this.ballTexture = new Texture(this.createTexture(512, 512, 32, 32), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });

        const colorSpline = new LinearSpline((x, a, b) => vec4.lerp(vec4.create(), a, b, x));
        colorSpline.addPoint(0, [1, 1, 1, 1]);
        colorSpline.addPoint(1, [0.5, 0.5, 0.5, 1]);

        this.ball = new Drawable(
            new Sphere({
                colors: colorSpline,
                radius: 6,
            }),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            this.ballTexture
        );
        
        this.things = [];
        for(let i = 0; i < 8; ++i) {
            const thing = new Drawable(
                new MyMesh({
                    colors: [
                        [1, 1, 1, 1],
                        [0.5, 0.5, 0.5, 1]
                    ]
                }),
                new ShaderInstance(Gol.graphics.getShader("simple")),
                null
            );
            vec3.set(thing.scale, 40, 40, 80);
            this.things.push(thing);
            thing.position[2] = 200 - i * 80;
        }

    }

    resize(width, height) {
        this.cam.viewportWidth = width;
        this.cam.viewportHeight = height;
        this.cam.updateProjection();
    }

    render(delta) {
        this.totalTime += delta;

        Gol.gl.viewport(0, 0, Gol.graphics.width, Gol.graphics.height);

        Gol.gl.enable(Gol.gl.DEPTH_TEST);
        Gol.gl.clearColor(0, 0, 0, 1.0);

        Gol.gl.clear(Gol.gl.COLOR_BUFFER_BIT | Gol.gl.DEPTH_BUFFER_BIT);

        const constants = {

        };

        this.cam.updateConstants(constants);

        const dataArray = Gol.audio.getFrequencyData();

        const lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
        const upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);

        const overallAvg = MathUtils.avg(dataArray);
        const lowerMax = MathUtils.max(lowerHalfArray);
        const lowerAvg = MathUtils.avg(lowerHalfArray);
        const upperMax = MathUtils.max(upperHalfArray);
        const upperAvg = MathUtils.avg(upperHalfArray);

        const lowerMaxFr = lowerMax / lowerHalfArray.length;
        const lowerAvgFr = lowerAvg / lowerHalfArray.length;
        const upperMaxFr = upperMax / upperHalfArray.length;
        const upperAvgFr = upperAvg / upperHalfArray.length;

        const globalColor = hslToRgb((this.totalTime * 0.1) % 1, 1, 0.5).map(e => e / 255);

        for(let thing of this.things) {
            thing.position[2] += lowerAvg * delta;
            quat.rotateZ(thing.rotation, thing.rotation, delta * lowerAvg * 0.01);
            if(thing.position[2] > 200) {
                thing.position[2] -= this.things.length * 80;
            }
            const v = (1 - MathUtils.sat(-thing.position[2] / (this.things.length * 80))) * 0.2;
            constants.ambientColor = globalColor.map(e => e * v);
            thing.draw(constants);
        }

        //Gol.gl.enable(Gol.gl.BLEND);
        //Gol.gl.blendFunc(Gol.gl.ONE, Gol.gl.ONE_MINUS_SRC_ALPHA);

        {
            const bassFr = MathUtils.lerp(MathUtils.step(0, 1, lowerMaxFr ** 0.8), 0, 8);
            const treFr = MathUtils.lerp(MathUtils.step(0, 1, upperAvgFr), 0, 4);

            const positionBuffer = this.ball.mesh.buffers.get("positions");
            const time = performance.now() * 0.000001;
            const amp = 7;
            const rf = 0.00001;
            const offset = this.ball.mesh.options.radius;

            for (let i = 0; i < positionBuffer.data.length; i += 3) {
                const v = [positionBuffer.data[i], positionBuffer.data[i + 1], positionBuffer.data[i + 2]];
                vec3.normalize(v, v);
                const distance = (offset + bassFr ) + this.noise.noise3D(v[0] + time *rf*7, v[1] +  time*rf*8, v[2] + time*rf*9) * amp * treFr;
                vec3.scale(v, v, distance);
                for (let j = 0; j < 3; ++j) {
                    positionBuffer.data[i + j] = v[j];
                }
            }
            positionBuffer.buffer = null;
        }

        constants.ambientColor = globalColor;

        quat.rotateY(this.ball.rotation, this.ball.rotation, delta * 0.4);
        this.ball.draw(constants);

        Gol.gl.disable(Gol.gl.BLEND);
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new VisualizerDemo()));