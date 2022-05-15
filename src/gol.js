import { Files } from "./files.js";
import { Game } from "./game.js";
import { Graphics } from "./graphics.js";
import * as graphics from "./graphics/_index.js";
import { Input } from "./input.js";
import * as glMatrix from "gl-matrix";
import * as math from "./math/_index.js";

class Gol {

    /**
     * 
     * @type {Graphics}
     */
    static graphics;

    /**
     * 
     * @type {Files}
     */
    static files;

    /**
     * 
     * @type {Input}
     */
    static input;
    
    /**
     * 
     * @param {Game} game 
     */
    static async init(game) {
        this.graphics = new Graphics(game);
        this.files = new Files();
        this.input = new Input();

        this.input.initEvents();

        this.graphics.compileShaders();
        this.graphics.generateFonts();
        
        game.preload();
        await this.files.waitForAssetsToLoad();

        game.create();

        addEventListener("resize", () => this.graphics.onResize());
        this.graphics.onResize();
        this.graphics.onResume();
    }

    static get gl() {
        return this.graphics.gl;
    }

}

export {
    Gol,
    Game,
    graphics,
    glMatrix,
    math
}