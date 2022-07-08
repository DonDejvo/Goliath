import { Screen } from './screen.js';

/**
 * <p>An instance of <code>Game</code> must be passed into initialization.</p>
 * <p>All methods are called after WebGL context exists. So you can safely create and manipulate graphics resources.</p>
 * <p>This allows easily to have multiple screens.</p>
 *
 * @author DonDejvo
 */
class Game {

    /**
     *
     * @type {Screen}
     */
    screen = null;

    constructor() {}

    /**
     *
     */
    preload() {}

    /**
     * Called right after initialization.
     */
    create() {}

    /**
     * Called when window is resized.
     *
     * @param {number} width the new width in pixels
     * @param {number} height the new height in pixels
     */
    resize( width, height ) {

        if ( this.screen ) {

            this.screen.resize( width, height );

        }

    }

    /**
     * Called when the game should render itself.
     *
     * @param {number} delta the time in seconds since the last render
     */
    render( delta ) {

        if ( this.screen ) {

            this.screen.render( delta );

        }

    }

    /**
     * Sets the current screen. {@link Screen#hide} is called on any old
     * screen and {@link Screen#show} is called on the new screen.
     *
     * @param {Screen} screen may be {@code null}
     */
    setScreen( screen ) {

        if ( this.screen ) {

            this.screen.hide();

        }

        this.screen = screen;
        this.screen.show();

    }

}

export {
    Game
};
