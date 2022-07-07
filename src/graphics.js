import { Game } from './game.js';
import { Gol } from './gol.js';
import { Font } from './graphics/font.js';
import { Shader } from './graphics/shader.js';

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

    /**
     *
     * @type {Map<string, Shader>}
     */
    shaders = new Map();

    /**
     *
     * @type {Map<string, Font>}
     */
    fonts = new Map();

    constructor( game ) {

        this.game = game;

        this.canvas = this.createCanvas();
        this.canvas.width = this.width = innerWidth;
        this.canvas.height = this.height = innerHeight;
        this.gl = this.canvas.getContext( 'webgl' );

    }

    onResume() {

        this.lastFrameTime = this.frameStart = performance.now();
        this.frames = 0;
        this.RAF();

    }

    createCanvas() {

        const canvas = document.createElement( 'canvas' );

        canvas.oncontextmenu = ( ev ) => {

            ev.preventDefault();
            ev.stopPropagation();

        };

        document.body.appendChild( canvas );

        return canvas;

    }

    onResize() {

        this.canvas.width = this.width = innerWidth;
        this.canvas.height = this.height = innerHeight;

        this.game.resize( this.width, this.height );

    }

    onDrawFrame() {

        const time = performance.now();

        this.delta = ( time - this.lastFrameTime ) * 0.001;
        this.lastFrameTime = time;

        Gol.input.update();

        this.game.render( this.delta );

        if ( time - this.frameStart >= 1000 ) {

            this.fps = this.frames;
            this.frames = 0;
            this.frameStart = time;

        }

        ++this.frames;

    }

    RAF() {

        this.frameId = requestAnimationFrame( () => {

            this.RAF();
            this.onDrawFrame();

        } );

    }

    compileShaders() {

        this.shaders.set( 'simple',
            new Shader( Shader.SIMPLE_VS, Shader.SIMPLE_FS ) );

        this.shaders.set( 'texture',
            new Shader( Shader.TEXTURE_VS, Shader.TEXTURE_FS ) );

        this.shaders.set( 'particle',
            new Shader( Shader.PARTICLE_VS, Shader.PARTICLE_FS ) );

    }

    generateFonts() {

        this.fonts.set( 'Consolas',
            new Font( {
                fontFamily: 'Consolas',
                fontSize: 48,
                charRatio: 0.6
            } ) );

    }

    getShader( name ) {

        return this.shaders.get( name );

    }

    getFont( name ) {

        return this.fonts.get( name );

    }

}

export {
    Graphics
};
