import { Gol, Game, Screen } from "../../dist/goliath.js";

class MainScreen extends Screen {

    constructor(game) {
        super();

        this.game = game;
    }

    show() {
        console.log("Hello world");
    }

}

class MinecraftDemo extends Game {

    preload() {
        Gol.files.loadImage("grass", "assets/grass.png");
        Gol.files.loadImage("cobblestone", "assets/cobblestone.png");
        Gol.files.loadImage("dirt", "assets/dirt.png");
        Gol.files.loadImage("snakewood", "assets/snakewood.png");
        Gol.files.loadImage("leaves", "assets/leaves.png");
    }

    create() {
        this.setScreen(new MainScreen(this));
    }

}

addEventListener("DOMContentLoaded", () => Gol.init(new MinecraftDemo()));