
class MathUtils {

    static lerp(x, a, b) {
        return (b - a) * x + a;
    }

    static rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randInt(min, max) {
        return Math.floor(this.rand(min, max + 1));
    }

    static clamp(x, a, b) {
        return Math.min(Math.max(x, a), b);
    }

    static sat(x) {
        return this.clamp(x, 0, 1);
    }

    static shuffle(arr) {
        for(let i = 0; i < arr.length; ++i) {
            const idx = this.randInt(0, arr.length - 1);
            [arr[i], arr[idx]] = [arr[idx], arr[i]];
        }
    }

    static choice(arr) {
        return arr[this.randInt(0, arr.length - 1)];
    }

    static isPowerOf2(x) {
        return (x & (x - 1)) == 0;
    }

    static max(arr) {
        return Math.max(...arr);
    }

    static min(arr) {
        return Math.min(...arr);
    }

    static avg(arr) {
        return arr.reduce((acc, a) => acc + a) / arr.length;
    }

    static step(edge1, edge2, x) {
        return (x - edge1) / (edge2 - edge1);
    }

}

export {
    MathUtils
}