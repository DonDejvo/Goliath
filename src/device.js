
class Device {

    /**
     * 
     * @type {string}
     */
    type;

    /**
     * 
     * @type {boolean}
     */
    isIOS;

    constructor() {

        this.detectDeviceType();
    }

    detectDeviceType() {
        const ua = navigator.userAgent;

        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test(ua)) {
            this.type = "mobile";
        } else {
            this.type = "desktop";
        }
        
        this.isIOS = /iPhone|iPad|iPod/i.test(ua);
    }

}

export {
    Device
}