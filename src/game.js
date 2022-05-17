import { Screen } from "./screen.js";

class Game {

    /**
     * 
     * @type {Screen}
     */
    screen = null;

    constructor() {}

    preload() {}

    create() {}

    resize(width, height) {
        if(this.screen) {
            this.screen.resize(width, height);
        }
    }

    render(delta) {
        if(this.screen) {
            this.screen.render(delta);
        }
    }

    setScreen(screen) {
        if(this.screen) {
            this.screen.hide();
        }
        this.screen = screen;
        this.screen.show();
    }

}

export {
    Game
}