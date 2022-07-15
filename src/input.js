import { Gol } from "./gol";

class Input {

    static MAX_TOUCHES = 10;

    touchInfo = [];

    keyInfo = {
        currentlyPressed: new Set(),
        previouslyPressed: new Set(),
        justPressed: new Set()
    };

    constructor() {
        for (let i = 0; i < Input.MAX_TOUCHES; ++i) {
            this.touchInfo[i] = {
                x: 0,
                y: 0,
                prevX: 0,
                prevY: 0,
                deltaX: 0,
                deltaY: 0,
                isTouched: false,
                wasTouched: false,
                isJustTouched: false
            };
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

    initEvents() {

        const canvas = Gol.graphics.canvas;

        addEventListener("keydown", (ev) => this.onKeyDown(ev));
        addEventListener("keyup", (ev) => this.onKeyUp(ev));

        canvas.addEventListener("touchstart", (ev) => this.handleTouchEvent(ev));
        canvas.addEventListener("touchmove", (ev) => this.handleTouchEvent(ev));
        canvas.addEventListener("touchend", (ev) => this.handleTouchEvent(ev));

        canvas.addEventListener("mousedown", (ev) => this.handleMouseEvent(ev));
        canvas.addEventListener("mousemove", (ev) => this.handleMouseEvent(ev));
        canvas.addEventListener("mouseup", (ev) => this.handleMouseEvent(ev));

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

        this.keyInfo.currentlyPressed.forEach((val) => {
            if(!this.keyInfo.previouslyPressed.has(val)) {
                this.keyInfo.justPressed.add(val);
            }
        });
        this.keyInfo.previouslyPressed = new Set(this.keyInfo.currentlyPressed);

        for(let info of this.touchInfo) {
            info.isJustTouched = info.isTouched && !info.wasTouched;
            info.wasTouched = info.isTouched;
            if(info.isJustTouched) {
                info.prevX = info.x;
                info.prevY = info.y;
            }
            info.deltaX = info.x - info.prevX;
            info.deltaY = info.y - info.prevY;
            info.prevX = info.x;
            info.prevY = info.y;
        }

    }

}

export {
    Input
}