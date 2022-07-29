
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

        if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i.test( ua ) ) {

            this.type = 'mobile';

        } else {

            this.type = 'desktop';

        }
<<<<<<< HEAD

=======
        
        this.isIOS = /iPhone|iPad|iPod/i.test(ua);
>>>>>>> 378055e7aafd91ccbdea1e168957e00facd76e27
    }

}

export {
    Device
};
