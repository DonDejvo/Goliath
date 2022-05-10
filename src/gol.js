import { Game } from "./game.js";
import { Graphics } from "./graphics/graphics.js";

class Gol {

    /**
     * 
     * @type {Graphics}
     */
    static graphics;

    static init(game) {
        this.graphics = new Graphics(game);

        this.graphics.onResume();
    }

    static get gl() {
        return this.graphics.gl;
    }

}

export {
    Gol,
    Game
}