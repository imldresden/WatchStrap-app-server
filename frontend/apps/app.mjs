export default class App {
    static name = "Abstract App"
    static description = "Must be overwriten"

    _watch;
    _loStrap;
    _upStrap;
    
    constructor(watch, loStrap, upStrap) {
        this._watch = watch;
        this._loStrap = loStrap;
        this._upStrap = upStrap;
    }

    initApp() {
        // init the app, e.g., d3 setup
        // for mouse / touch events, use mouse* events binded via d3
    }

    onBezelRotate() {
        // handle bezel rotate event
    }

    onHwkey() {
        // handle hardware key event
    }
}