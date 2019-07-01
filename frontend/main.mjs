import TestApp from './apps/test-app.mjs';

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
    }
};

class Main {

    #identifier = "main";
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
                <script>
                    //window.drawnListener = [];
                    //var onDrawn = () => { window.drawnListener.forEach((cb) => cb(window.surId) ); };
                    //new SSVG({onDrawn: onDrawn});
                </script>
            </body>`;
    }

    initFrontEnd() {
        let now = Date.now();
        this.#surfacesLastUpdate['watch'] = now;
        this.#surfacesLastUpdate['lowerStrap'] = now;
        this.#surfacesLastUpdate['upperStrap'] = now;

        this.loadApp(TestApp);
    }

    loadApp(app) {
        if (this.#curApp)
            this.clearCurApp();

        this.loadSurfaces({
            upperStrap: 'einkBw',
            watch: 'watchGearS3',
            lowerStrap: 'einkBw'
        }, app);


    }

    loadSurfaces(displayIds, app) {
        if (Object.keys(displayIds).length !== 3)
            throw Error('wrong number of display ids, expected 3');

        this.surfaces = {};

        for (let surId in displayIds) {
            let d = displayConfigs[displayIds[surId]];
            let surface = document.createElement('iframe');
            surface.setAttribute('id', surId + "Surface");
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

    onInfo(msg) {
        if(!msg.type)
            return;

        switch (msg.type) {
            case 'connect':
                console.log('device connected:', msg.identifier);
                break;
            case 'disconnect':
                console.log('device disconnected:', msg.identifier);
                break;
        }
    }

    onMsgError(e) {
        console.log("error", e);
    }

    onMsg(msg) {
        if (!msg.type)
            return;

        switch (msg.type) {
            // handle messages
        }
    }

    onSurfaceLoaded(surId, surface, app) {
        this.#surfaces[surId] = surface;
        //surface.contentWindow.drawnListener.push(this.onSurfaceUpdate);
        new surface.contentWindow.SSVG({onDrawn: () => this.onSurfaceUpdate(surId)});

        if (Object.keys(this.#surfaces).length === 3 && !this.#curApp) {
            this.#curApp = new app(
                this.#surfaces['watch'].contentWindow,
                this.#surfaces['lowerStrap'].contentWindow,
                this.#surfaces['upperStrap'].contentWindow,
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
            }, lastUpdate + 205);
            return;
        } else if (timer)
            return;

        let canvas = surface.contentWindow.document.getElementsByTagName('canvas')[0];
        let imgData = canvas.toDataURL("image/jpeg", 0.6);
        let msg = {
            target: surId,
            type: 'imageData',
            payload: imgData
        };

        this.#socket.emit('msg', msg);
        this.#surfacesLastUpdate[surId] = Date.now();
        //console.log('update on', surId, imgData);
    }
}

new Main();

/* Old code


        this.lastUpdate = Date.now();
        this.timeout = undefined;
 */