import TestApp from './apps/test-app.mjs';

const displayConfigs = {
    watchGearS3: {
        width: 360,
        height: 360,
        color: 'full'
    }
};

class Main {

    #identifier = "main";
    #curApp;
    #socket;

    appContainer;

    constructor() {
        this.#socket = io();

        this.#socket.on('connect', () => {
            this.#socket.emit('handshake', this.#identifier);
        });

        this.#socket.on('err', e => this.onMsgError(e));
        this.#socket.on('msg', msg => this.onMsg(msg));

        this.appContainer = document.querySelector('#appContainer');

        this.loadApp(TestApp);
    }

    clearCurApp() {
        while (this.appContainer.firstChild)
            this.appContainer.removeChild(this.appContainer.firstChild);
        this.#curApp = undefined;
    }

    loadSurfaces(watchId, lowerStrapId, upperStrapId) {
        // Prepare containers
        let watchContainer = document.createElement('iframe');
        let lowerStrapContainer = document.createElement('iframe');
        let upperStrapContainer = document.createElement('div');
        watchContainer.setAttribute('id', 'watchContainer');
        lowerStrapContainer.setAttribute('id', 'lowerStrapContainer');
        upperStrapContainer.setAttribute('id', 'upperStrapContainer');
        this.appContainer.appendChild(watchContainer);
        this.appContainer.appendChild(lowerStrapContainer);
        //this.appContainer.appendChild(upperStrapContainer);


        watchContainer.contentWindow.document.open();
        watchContainer.contentWindow.document.write("<head><title></title><script src='https://d3js.org/d3.v5.min.js'></script><script src='js/ssvg.js'></script></head></head><body></body><svg id='watch' height='360' width='360'></svg><script>new SSVG();</script></body>");
        watchContainer.contentWindow.document.close();

        watchContainer.contentWindow.onload = () => {
            let watchSvg = watchContainer.contentWindow.d3.select('svg');
            console.log(JSON.stringify(watchSvg));
            new TestApp(watchSvg);
        };



        return;
        new TestApp(watchSvg);
        setTimeout(() => {
        lowerStrapContainer.innerHTML = "<svg id='strap' height='360' width='360'></svg>";
        new TestApp('strap');
        }, 2000);

        /*
        // Prepare watch surface
        let watch = displayConfigs[watchId];
        let watchSvg = document.createElement('svg');
        watchSvg.setAttribute('width', watch.width);
        watchSvg.setAttribute('height', watch.height);
        watchSvg.setAttribute('id', watchId);

        this.appContainer.appendChild(watchSvg);
        let watchSvg = document.getElementById('watch');
        new SSVG({
            onDrawn: () => { this.onSurfaceUpdate('watch', watchId); }
            //svgElement: watchSvg
        });*/

        // Skip straps for now

        //return d3.select(watchSvg);
    }

    loadApp(app) {
        if (this.#curApp)
            this.clearCurApp();

        let watchSvg = this.loadSurfaces('watchGearS3');
        //this.#curApp = new app(watchSvg);
    }

    onMsgError(e) {
        console.log("error", e);
    }

    onMsg(msg) {
        console.log("msg", msg);
    }

    onSurfaceUpdate(surface, displayId) {

    }
}

new Main();

/* Old code


        this.lastUpdate = Date.now();
        this.timeout = undefined;
 */