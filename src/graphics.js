import { Game } from "./game.js";

class Graphics {

    /**
     * 
     * @type {HTMLCanvasElement}
     */
    canvas;

    /**
     *  
     * @type {WebGLRenderingContext}
     */
    gl;

    /**
     * 
     * @type {number}
     */
    frameId = null;

    /**
     * 
     *  @type {number} 
     */
    width;

    /** 
     * 
     * @type {number}
     */
    height;

    /**
     * 
     * @type {number}
     */
    delta = 0;

    /**
     * 
     * @type {number}
     */
    fps = 60;

    /**
     * 
     * @type {number}
     */
    lastFrameTime;

    /**
     * 
     * @type {number}
     */
    frameStart;

    /**
     * 
     * @type {number}
     */
    frames;

    /**
     * 
     * @type {Game}
     */
    game;

    constructor(game) {
        this.game = game;

        this.canvas = this.createCanvas();
        this.canvas.width = this.width = innerWidth;
        this.canvas.height = this.height = innerHeight;
        this.gl = this.canvas.getContext("webgl");
    }

    onResume() {
        this.lastFrameTime = this.frameStart = performance.now();
        this.frames = 0;
        this.RAF();
    }

    createCanvas() {
        const canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        return canvas;
    }

    onResize() {
        this.canvas.width = this.width = innerWidth;
        this.canvas.height = this.height = innerHeight;

        this.game.resize(this.width, this.height);
    }

    onDrawFrame() {
        const time = performance.now();
        this.delta = (time - this.lastFrameTime) * 0.001;
        this.lastFrameTime = time;

        this.game.render(this.delta);

        if (time - this.frameStart >= 1000) {
			this.fps = this.frames;
			this.frames = 0;
			this.frameStart = time;
		}
		++this.frames;
    }

    RAF() {
        this.frameId = requestAnimationFrame(() => {
            this.RAF();
            this.onDrawFrame();
        });
    }

}

export {
    Graphics
}