<<<<<<< HEAD
import { Gol } from './gol';
=======
import { Gol } from "./gol.js";
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27

class Input {

    static MAX_TOUCHES = 10;

    /**
     * 
     * @type {TouchInfo[]}
     */
    touchInfo = [];

    keyInfo = new KeyInfo();

    constructor() {
<<<<<<< HEAD

        for ( let i = 0; i < Input.MAX_TOUCHES; ++i ) {

            this.touchInfo[ i ] = {
                x: null,
                y: null,
                isTouched: false,
                wasTouched: false,
                isJustTouched: false
            };

=======
        for (let i = 0; i < Input.MAX_TOUCHES; ++i) {
            this.touchInfo[i] = new TouchInfo();
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
        }

    }

    isKeyPressed( key ) {

        return this.keyInfo.currentlyPressed.has( key );

    }

    isKeyClicked( key ) {

        return this.keyInfo.justPressed.has( key );

    }

    isTouched( touchId = 0 ) {

        return this.touchInfo[ touchId ].isTouched;

    }

    isJustTouched( touchId = 0 ) {

        return this.touchInfo[ touchId ].isJustTouched;

    }

    isMousePressed() {

        return this.isTouched();

    }

    isMouseClicked() {

        return this.isJustTouched();

    }

    getX( touchId = 0 ) {

        return this.touchInfo[ touchId ].x;

    }

    getY( touchId = 0 ) {

        return this.touchInfo[ touchId ].y;

    }

    getDeltaX(touchId = 0) {
        return this.touchInfo[touchId].deltaX;
    }

    getDeltaY(touchId = 0) {
        return this.touchInfo[touchId].deltaY;
    }

    /**
     * 
     * @param {HTMLElement} elem 
     */
    initEvents(elem) {

        addEventListener( 'keydown', ( ev ) => this.onKeyDown( ev ) );
        addEventListener( 'keyup', ( ev ) => this.onKeyUp( ev ) );

<<<<<<< HEAD
        canvas.addEventListener( 'touchstart', ( ev ) => this.handleTouchEvent( ev ) );
        canvas.addEventListener( 'touchmove', ( ev ) => this.handleTouchEvent( ev ) );
        canvas.addEventListener( 'touchend', ( ev ) => this.handleTouchEvent( ev ) );

        canvas.addEventListener( 'mousedown', ( ev ) => this.handleMouseEvent( ev ) );
        canvas.addEventListener( 'mousemove', ( ev ) => this.handleMouseEvent( ev ) );
        canvas.addEventListener( 'mouseup', ( ev ) => this.handleMouseEvent( ev ) );

    }

    handleTouchEvent( ev ) {
=======
        if (Gol.device.type == "mobile") {
            elem.addEventListener("touchstart", (ev) => this.handleTouchEvent(ev));
            elem.addEventListener("touchmove", (ev) => this.handleTouchEvent(ev));
            elem.addEventListener("touchend", (ev) => this.handleTouchEvent(ev));
        } else {
            elem.addEventListener("mousedown", (ev) => this.handleMouseEvent(ev));
            elem.addEventListener("mousemove", (ev) => this.handleMouseEvent(ev));
            elem.addEventListener("mouseup", (ev) => this.handleMouseEvent(ev));
        }

    }

    /**
     * 
     * @param {TouchEvent} ev 
     */
    handleTouchEvent(ev) {
        if(ev.cancelable) {
            ev.preventDefault();
        }
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27

        const boundingRect = ev.target.getBoundingClientRect();

        for ( const touch of ev.changedTouches ) {

            const x = touch.pageX - boundingRect.x;
            const y = touch.pageY - boundingRect.y;

<<<<<<< HEAD
            const touchInfo = this.touchInfo[ touch.identifier ];
=======
            let touchInfo = this.touchInfo.find(e => e.id === touch.identifier);
            if (!touchInfo) {
                touchInfo = this.touchInfo.find(e => !e.isTouched);
                touchInfo.id = touch.identifier;
                if (!touchInfo) {
                    continue;
                }
            }
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27

            touchInfo.x = x;
            touchInfo.y = boundingRect.height - y;

            switch ( ev.type ) {

                case 'touchstart':
                    touchInfo.isTouched = true;
                    break;
                case 'touchend':
                    touchInfo.isTouched = false;
<<<<<<< HEAD

=======
                    touchInfo.id = null;
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
            }

        }

    }

<<<<<<< HEAD
    handleMouseEvent( ev ) {
=======
    /**
     * 
     * @param {MouseEvent} ev 
     */
    handleMouseEvent(ev) {
        if(ev.cancelable) {
            ev.preventDefault();
        }
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27

        const boundingRect = ev.target.getBoundingClientRect();
        const x = ev.pageX - boundingRect.x;
        const y = ev.pageY - boundingRect.y;

        const touchInfo = this.touchInfo[ 0 ];

        touchInfo.x = x;
        touchInfo.y = boundingRect.height - y;

        switch ( ev.type ) {

            case 'mousedown':
                touchInfo.isTouched = true;
                break;
            case 'mouseup':
                touchInfo.isTouched = false;

        }

    }

<<<<<<< HEAD
    onKeyDown( ev ) {

        this.keyInfo.currentlyPressed.add( ev.code );

    }

    onKeyUp( ev ) {

        this.keyInfo.currentlyPressed.delete( ev.code );

=======
    /**
     * 
     * @param {KeyboardEvent} ev 
     */
    onKeyDown(ev) {
        if(ev.cancelable) {
            ev.preventDefault();
        }
        this.keyInfo.currentlyPressed.add(ev.code);
    }

    onKeyUp(ev) {
        if(ev.cancelable) {
            ev.preventDefault();
        }
        this.keyInfo.currentlyPressed.delete(ev.code);
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    }

    update() {

<<<<<<< HEAD
        this.keyInfo.currentlyPressed.forEach( ( val ) => {

            if ( !this.keyInfo.previouslyPressed.has( val ) ) {

                this.keyInfo.justPressed.add( val );

            }

        } );
        this.keyInfo.previouslyPressed = new Set( this.keyInfo.currentlyPressed );

        for ( const info of this.touchInfo ) {

            info.isJustTouched = info.isTouched && !info.wasTouched;
            info.wasTouched = info.isTouched;

=======
        this.keyInfo.update();

        for (let info of this.touchInfo) {
            info.update();
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
        }

    }

}

class TouchInfo {

    id = null;
    x = 0;
    y = 0;
    prevX = 0;
    prevY = 0;
    deltaX = 0;
    deltaY = 0;
    isTouched = false;
    wasTouched = false;
    isJustTouched = false;

    update() {
        this.isJustTouched = this.isTouched && !this.wasTouched;
        this.wasTouched = this.isTouched;
        if (this.isJustTouched) {
            this.prevX = this.x;
            this.prevY = this.y;
        }
        this.deltaX = this.x - this.prevX;
        this.deltaY = this.y - this.prevY;
        this.prevX = this.x;
        this.prevY = this.y;
    }

}

class KeyInfo {

    /**
     * 
     * @type {Set<string>}
     */
    currentlyPressed = new Set();

    /**
     * 
     * @type {Set<string>}
     */
    previouslyPressed = new Set();

    /**
     * 
     * @type {Set<string>}
     */
    justPressed = new Set();

    update() {
        this.currentlyPressed.forEach((val) => {
            if (!this.previouslyPressed.has(val)) {
                this.justPressed.add(val);
            }
        });
        this.previouslyPressed = new Set(this.currentlyPressed);
    }
}

export {
    Input
};
