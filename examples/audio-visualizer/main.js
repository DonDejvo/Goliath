import { Gol, Game, Screen, graphics, glMatrix, math } from "../../dist/goliath.js";
const { Drawable, meshes, PerspectiveCamera, ShaderInstance, Texture } = graphics;
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

class VisualizerDemo extends Game {

    preload() {
        Gol.files.loadAudio("soundtrack", "https://assets.wixonic.fr/songs/Umbra - Ace Aura & Voicians.mp3");
    }

    createTexture(W, H, x, y) {
        const countX = x, countY = y;
        const ctx = document.createElement("canvas").getContext("2d");
        ctx.canvas.width = W;
        ctx.canvas.height = H;

        ctx.lineWidth = 2;

        for (let i = 0; i < countY; ++i) {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.moveTo(0, i / countY * H);
            ctx.lineTo(W, i / countY * H);
            ctx.stroke();
        }

        for (let i = 0; i < countX; ++i) {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.moveTo(i / countX * W, 0);
            ctx.lineTo(i / countX * W, H);
            ctx.stroke();
        }
        return ctx.canvas;
    }

    create() {
        this.totalTime = 0;
        this.noise = new SimplexNoise();

        Gol.audio.playBgMusic("soundtrack");
        Gol.audio.setFrequencyDataSize(1024);
        this.cam = new PerspectiveCamera(60, Gol.graphics.width, Gol.graphics.height, 0.1, 1000);
        this.cam.position[2] = 80;



        this.ballTexture = new Texture(this.createTexture(512, 512, 24, 24), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });

        this.planeTexture = new Texture(this.createTexture(1024, 1024, 16, 16), {
            filter: Gol.gl.LINEAR_MIPMAP_LINEAR
        });

        const colorSpline = new LinearSpline((x, a, b) => vec4.lerp(vec4.create(), a, b, x));
        colorSpline.addPoint(0, [1, 1, 1, 1]);
        colorSpline.addPoint(1, [0, 0, 0, 1]);

        this.ball = new Drawable(
            new Sphere({
                colors: colorSpline,
                radius: 12
            }),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            this.ballTexture
        );

        this.plane = new Drawable(
            new Plane({
                width: 200,
                depth: 200,
                widthSegments: 32,
                depthSegments: 32
            }),
            new ShaderInstance(Gol.graphics.getShader("texture")),
            this.planeTexture
        );
        this.plane.position[1] = -30;
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
            ambientColor: hslToRgb((this.totalTime * 0.1) % 1, 1, 0.5).map(e => e / 255)
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


        Gol.gl.enable(Gol.gl.BLEND);
        Gol.gl.blendFunc(Gol.gl.SRC_ALPHA, Gol.gl.ONE);

        this.plane.draw(constants);

        {
            const bassFr = MathUtils.lerp(MathUtils.step(0, 1, lowerMaxFr ** 0.8), 0, 12);
            const treFr = MathUtils.lerp(MathUtils.step(0, 1, upperAvgFr), 0, 6);

            const positionBuffer = this.ball.mesh.buffers.get("positions");
            const time = performance.now();
            const amp = 7;
            const rf = 0.00001;
            const offset = this.ball.mesh.options.radius;

            for (let i = 0; i < positionBuffer.data.length; i += 3) {
                const v = [positionBuffer.data[i], positionBuffer.data[i + 1], positionBuffer.data[i + 2]];
                const distance = (offset + bassFr) + this.noise.noise3D(v[0] + time * rf * 7, v[1] + time * rf * 8, v[2] + time * rf * 9) * amp * treFr;
                vec3.normalize(v, v);
                vec3.scale(v, v, distance);
                for (let j = 0; j < 3; ++j) {
                    positionBuffer.data[i + j] = v[j];
                }
            }
            positionBuffer.buffer = null;
        }

        {
            const positionBuffer = this.plane.mesh.buffers.get("positions");
            const disortionFr = MathUtils.lerp(MathUtils.step(0, 1, upperAvgFr), 0.5, 4);
            const amp = 2;
            const time = Date.now();
            for (let i = 0; i < positionBuffer.data.length; i += 3) {
                const v = [positionBuffer.data[i], positionBuffer.data[i + 1], positionBuffer.data[i + 2]];
                const distance = (this.noise.noise2D(v[0] + time * 0.0003, v[2] + time * 0.0001) + 0) * disortionFr * amp;
                positionBuffer.data[i + 1] = distance;
            }
            positionBuffer.buffer = null;
        }

        quat.rotateY(this.ball.rotation, this.ball.rotation, delta * 0.25);
        this.ball.draw(constants);


    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new VisualizerDemo()));