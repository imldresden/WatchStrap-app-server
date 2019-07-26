import TestApp from './apps/test-app.mjs';

const idMain = "MAIN";
const idWatch = "WATCH";
const idStrap = "STRAP";
const idUpperStrap = "UPPER_STRAP";
const idLowerStrap = "LOWER_STRAP";

const displayConfigs = {
    watchGearS3: {
        width: 360,
        height: 360,
        color: 'full'
    },
    einkBw: {
        width: 220,
        height: 400,
        color: 'bw'
    },
    digitalUpperStrap: {
        width: 270,
        height: 620,
        color: 'full'
    },
    digitalLowerStrap: {
        width: 270,
        height: 900,
        color: 'full'
    }
};

class Main {

    #identifier = idMain;
    #curApp;
    #socket;
    #surfaces = {};
    #surfacesLastUpdate = {};
    #surfacesTimer = {};

    appContainer;

    constructor() {

        this.connectToServer();

        this.appContainer = document.querySelector('#appContainer');
    }

    clearCurApp() {
        while (this.appContainer.firstChild)
            this.appContainer.removeChild(this.appContainer.firstChild);
        this.#curApp = undefined;
    }

    connectToServer(ip) {
        if (this.#socket)
            this.#socket.close();

        this.#socket = io(ip);

        this.#socket.on('connect', () => {
            this.#socket.emit('handshake', this.#identifier);
        });

        this.#socket.on('handshake', () => this.initFrontEnd());
        this.#socket.on('redirect', remoteAddress => this.connectToServer(remoteAddress));

        this.#socket.on('err', e => this.onMsgError(e));
        this.#socket.on('msg', msg => this.onMsg(msg));
        this.#socket.on('info', msg => this.onInfo(msg));
    }

    dispatchTouchEvent(surId, event) {
        let surface = this.#surfaces[surId];
        let canvas = surface.contentWindow.document.getElementsByTagName('canvas')[0];
        let newEvent = surface.contentWindow.document.createEvent('MouseEvent');

        let type;
        switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;
            case "touchend":   type = "mouseup";   break;
            default:           return;
        }

        newEvent.initMouseEvent(type, true, true, surface.contentWindow.document.defaultView, 0,
            event.pos.x, event.pos.y, event.pos.x, event.pos.y, false, false, false, false, 0, canvas
        );

        canvas.dispatchEvent(newEvent);

        console.debug(`dispatched event ${event.type} as ${type}:`, event, newEvent);
    }

    static generateSurfaceSkeleton(displayId) {
        let d = displayConfigs[displayId];
        return `
            <head>
                <title></title>
                <script src='https://d3js.org/d3.v5.min.js'></script>
                <script src='js/ssvg.js'></script>
            </head>
            <body style='margin:0;'>
                <svg id='surfaceSvg' height='${d.height}' width='${d.width}'></svg>
            </body>`;
    }

    initFrontEnd() {
        let now = Date.now();
        this.#surfacesLastUpdate[idWatch] = now;
        this.#surfacesLastUpdate[idLowerStrap] = now;
        this.#surfacesLastUpdate[idUpperStrap] = now;

        this.loadApp(TestApp);

        document.getElementById('debugUpdate')
            .addEventListener('click', () => this.onDebugUpdate());
        this.onDebugUpdate();
    }

    loadApp(app) {
        if (this.#curApp)
            this.clearCurApp();

        this.loadSurfaces({
            UPPER_STRAP: 'digitalUpperStrap',
            WATCH: 'watchGearS3',
            LOWER_STRAP: 'digitalLowerStrap'
        }, app);


    }

    loadSurfaces(displayIds, app) {
        if (Object.keys(displayIds).length !== 3)
            throw Error('wrong number of display ids, expected 3');

        for (let surId in displayIds) {
            let d = displayConfigs[displayIds[surId]];
            let surface = document.createElement('iframe');
            surface.setAttribute('id', surId + "-surface");
            surface.setAttribute("width", d.width);
            surface.setAttribute("height", d.height);
            this.appContainer.appendChild(surface);

            surface.contentWindow.document.open();
            surface.contentWindow.document.write(Main.generateSurfaceSkeleton(displayIds[surId]));
            surface.contentWindow.document.close();

            surface.contentWindow.onload = () => this.onSurfaceLoaded(surId, surface, app);

            surface.contentWindow.surId = surId;
            surface.contentWindow.colorMode = displayIds[surId].color;
        }
    }

    onDebugUpdate() {
        let overallScale = document.getElementById('debug-overall-scale').value;
        let overallX = document.getElementById('debug-overall-x').value;
        let overallY = document.getElementById('debug-overall-y').value;
        let spacing = document.getElementById('debug-spacing').value;

        let overallTrans = `rotate(90deg) translate(${overallY}px, ${overallX}px) scale(${overallScale})`;
        document.getElementById('appContainer').style.transform = overallTrans;
        document.getElementById(idUpperStrap + "-surface").style.transform = `translate(0, -${spacing}px)`;
        document.getElementById(idLowerStrap + "-surface").style.transform = `translate(0, ${spacing}px)`;
    }

    onInfo(msg) {
        if(!msg.type)
            return;

        switch (msg.type) {
            case 'connect':
                console.debug('device connected:', msg.identifier);
                break;
            case 'disconnect':
                console.debug('device disconnected:', msg.identifier);
                break;
        }
    }

    onMsgError(e) {
        console.info("error", e);
    }

    onMsg(msg) {
        if (!msg.type)
            return;

        switch (msg.type) {
            case 'touch':
                this.dispatchTouchEvent(msg.sender, msg.payload);
                break;
            case 'bezelrotate':
                // do stuff
                break;
        }
    }

    onSurfaceLoaded(surId, surface, app) {
        this.#surfaces[surId] = surface;
        new surface.contentWindow.SSVG({onDrawn: () => this.onSurfaceUpdate(surId)});

        if (Object.keys(this.#surfaces).length === 3 && !this.#curApp) {
            this.#curApp = new app(
                this.#surfaces[idWatch].contentWindow,
                this.#surfaces[idLowerStrap].contentWindow,
                this.#surfaces[idUpperStrap].contentWindow,
            );
        }
    }

    onSurfaceUpdate(surId) {
        let surface = this.#surfaces[surId];
        let lastUpdate = this.#surfacesLastUpdate[surId];
        let timer = this.#surfacesTimer[surId];
        let now = Date.now();
        if (now - lastUpdate <= 200 && !timer) {
            this.#surfacesTimer[surId] = setTimeout(() => {
                this.#surfacesTimer[surId] = undefined;
                this.onSurfaceUpdate(surId);
            }, 205);
            return;
        } else if (timer)
            return;

        setTimeout(() => {
            let canvas = surface.contentWindow.document.getElementsByTagName('canvas')[0];
            let imgData = canvas.toDataURL("image/jpeg", 0.6);
            let msg = {
                target: surId,
                type: 'imageData',
                payload: imgData
            };

            this.#socket.emit('msg', msg);
            this.#surfacesLastUpdate[surId] = Date.now();
        }, 10);
    }
}
new Main();
