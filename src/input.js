class Input {

    static MAX_TOUCHES = 10;

    /**
     * 
     * @type {TouchInfo[]}
     */
    touchInfo = [];

    keyInfo = new KeyInfo();

    constructor() {
        for (let i = 0; i < Input.MAX_TOUCHES; ++i) {
            this.touchInfo[i] = new TouchInfo();
        }
    }

    isKeyPressed(key) {
        return this.keyInfo.currentlyPressed.has(key);
    }

    isKeyClicked(key) {
        return this.keyInfo.justPressed.has(key);
    }

    isTouched(touchId = 0) {
        return this.touchInfo[touchId].isTouched;
    }

    isJustTouched(touchId = 0) {
        return this.touchInfo[touchId].isJustTouched;
    }

    isMousePressed() {
        return this.isTouched();
    }

    isMouseClicked() {
        return this.isJustTouched();
    }

    getX(touchId = 0) {
        return this.touchInfo[touchId].x;
    }

    getY(touchId = 0) {
        return this.touchInfo[touchId].y;
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

        addEventListener("keydown", (ev) => this.onKeyDown(ev));
        addEventListener("keyup", (ev) => this.onKeyUp(ev));

        elem.addEventListener("touchstart", (ev) => this.handleTouchEvent(ev));
        elem.addEventListener("touchmove", (ev) => this.handleTouchEvent(ev));
        elem.addEventListener("touchend", (ev) => this.handleTouchEvent(ev));

        elem.addEventListener("mousedown", (ev) => this.handleMouseEvent(ev));
        elem.addEventListener("mousemove", (ev) => this.handleMouseEvent(ev));
        elem.addEventListener("mouseup", (ev) => this.handleMouseEvent(ev));

    }

    handleTouchEvent(ev) {

        const boundingRect = ev.target.getBoundingClientRect();

        for (let touch of ev.changedTouches) {

            const x = touch.pageX - boundingRect.x;
            const y = touch.pageY - boundingRect.y;

            const touchInfo = this.touchInfo[touch.identifier];

            touchInfo.x = x;
            touchInfo.y = boundingRect.height - y;

            switch (ev.type) {
                case "touchstart":
                    touchInfo.isTouched = true;
                    break;
                case "touchend":
                    touchInfo.isTouched = false;
            }

        }

    }

    handleMouseEvent(ev) {

        const boundingRect = ev.target.getBoundingClientRect();
        const x = ev.pageX - boundingRect.x;
        const y = ev.pageY - boundingRect.y;

        const touchInfo = this.touchInfo[0];

        touchInfo.x = x;
        touchInfo.y = boundingRect.height - y;

        switch (ev.type) {
            case "mousedown":
                touchInfo.isTouched = true;
                break;
            case "mouseup":
                touchInfo.isTouched = false;
        }

    }

    onKeyDown(ev) {
        this.keyInfo.currentlyPressed.add(ev.code);
    }

    onKeyUp(ev) {
        this.keyInfo.currentlyPressed.delete(ev.code);
    }

    update() {

        this.keyInfo.update();

        for (let info of this.touchInfo) {
            info.update();
        }

    }

}

class TouchInfo {

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
}