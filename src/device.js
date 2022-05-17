
class Device {

    /**
     * 
     * @type {string}
     */
    type;

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
    }

}

export {
    Device
}