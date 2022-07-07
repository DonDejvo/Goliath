/**
 * Represents one of game screens, such as a main menu, a settings menu, the game screen and so on.
 *
 * @author DonDejvo
 *
 * @see Game
 */
class Screen {

    constructor() {

        this.create();

    }

    create() {}

    /**
     * Called when this screen becomes the current screen for a {@link Game}.
     */
    show() {}

    /**
     * Called when this screen is no longer current scene for a {@link Game}.
     */
    hide() {}

    /**
     * @see Game#resize
     */
    resize( width, height ) {}

    /**
     * Called when the screen should render itself.
     *
     * @param {number} delta the time in seconds since the last render
     */
    render( delta ) {}

    dispose() {}

}

export {
    Screen
};
