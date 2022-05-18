class Rectangle {

    x;

    y;

    width;

    height;

    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setPosition(...args) {
        if(args.length == 1) {
            this.x = args[0][0];
            this.y = args[0][1];
        } else if(args.length == 2) {
            this.x = args[0];
            this.y = args[1];
        } else {
            throw new Error("1 or 2 arguments required");
        }
        return this;
    }

    setSize(...args) {
        if(args.length == 1) {
            this.width = args[0][0];
            this.height = args[0][1];
        } else if(args.length == 2) {
            this.width = args[0];
            this.height = args[1];
        } else {
            throw new Error("1 or 2 arguments required");
        }
        return this;
    }

    copy(r) {
        this.x = r.x;
        this.y = r.y;
        this.width = r.width;
        this.height = r.height;
    }

    clone() {
        return new Rectangle(this.x, this.y, this.width, this.height);
    }

    containsPoint(...args) {
        let x, y;

        if(args.length == 2) {
            x = args[0];
            y = args[1];
        } else if(args.length == 1) {
            x = args[0][0];
            y = args[0][1];
        } else {
            throw new Error("1 or 2 arguments required");
        }

        return this.x <= x && 
            this.x + this.width >= x && 
            this.y <= y && 
            this.y + this.height >= y;
    }

    containsRectangle(rectangle) {
        const xmin = rectangle.x;
		const xmax = xmin + rectangle.width;

		const ymin = rectangle.y;
		const ymax = ymin + rectangle.height;

		return xmin > this.x && xmin < this.x + this.width && 
            xmax > this.x && xmax < this.x + this.width && 
            ymin > this.y && ymin < this.y + this.height &&
            ymax > this.y && ymax < this.y + this.height;
    }

    overlaps(r) {
        return this.x < r.x + r.width && 
            this.x + this.width > r.x && 
            this.y < r.y + r.height && 
            this.y + this.height > r.y;
    }

    area() {
        return this.width * this.height;
    }

    perimeter() {
        return (this.width + this.height) * 2;
    }

}

export {
    Rectangle
}