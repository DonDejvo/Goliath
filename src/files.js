
class Files {

    /**
     * 
     * @type {Map<string, HTMLImageElement | HTMLAudioElement>}
     */
    assets = new Map();

    /**
     * 
     * @type {number}
     */
    toLoad = 0;

    loadImage(name, url) {
        const image = new Image();
        image.src = url;
        image.crossOrigin = "Anonymous";
        const promise = new Promise(resolve => {
            image.onload = () => {
                resolve(image);
            }
        })
        this.addAsync(name, promise);
        return promise;
    }

    loadAudio(name, url) {
        const audio = new Audio(url);
        audio.load();
        const promise = new Promise(resolve => {
            audio.oncanplaythrough = () => {
                resolve(audio);
            }
        });
        this.addAsync(name, promise);
        return promise;
    }

    addAsync(name, promise) {
        ++this.toLoad;
        promise.then(asset => {
            this.assets.set(name, asset);
            --this.toLoad;
        });
    }

    waitForAssetsToLoad() {
        return new Promise(resolve => {
            const wait = () => {
                if(this.toLoad == 0) {
                    resolve(this.assets);
                } else {
                    setTimeout(() => {
                        wait();
                    }, 250);
                }
            }
            wait();
        });
    }

    get(name) {
        return this.assets.get(name);
    }

}

export {
    Files
}