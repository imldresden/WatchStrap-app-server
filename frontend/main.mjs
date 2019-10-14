import Surface from './surface.mjs';
import TestApp from './apps/test-app.mjs';
import Drawer from './apps/drawer.mjs';
import ActivityTracker from './apps/activity-tracker.mjs';
import MusicPlayer from './apps/music-player.mjs';
import MapFinder from './apps/map-finder.mjs';
import PatternBand from './apps/pattern-band.mjs';
import MoodBand from './apps/mood-band.mjs';
import FinanceData from './apps/finance-data.mjs';
import PublicTransport from './apps/public-transport.mjs';
import FlashLight from './apps/flash-light.mjs';
import FriendlyReminder from './apps/friendly-reminder.mjs';

const idMain = "MAIN";
const idWatch = "WATCH";
const idUpperStrap = "UPPER_STRAP";
const idLowerStrap = "LOWER_STRAP";

const displayConfigs = {
    watchGearS3: {
        width: 360,
        height: 360,
        dpi: 278,
        updateInterval: 100,
        type: 'oled',
        imageFormat: 'jpeg',
        color: 'full'
    },
    einkBw: {
        width: 104,
        height: 212,
        dpi: 105,
        updateInterval: 1200,
        type: 'eink',
        imageFormat: 'bitarray',
        color: 'bw'
    },
    digitalUpperStrap: {
        width: 250,
        height: 620,
        dpi: 274,
        updateInterval: 0,
        type: 'onscreen',
        imageFormat: 'none',
        color: 'full'
    },
    digitalLowerStrap: {
        width: 250,
        height: 900,
        dpi: 274,
        updateInterval: 0,
        type: 'onscreen',
        imageFormat: 'none',
        color: 'full'
    }
};

const setups = {
    tablet: {
        UPPER_STRAP: 'digitalUpperStrap',
        WATCH: 'watchGearS3',
        LOWER_STRAP: 'digitalLowerStrap',
    },
    einkPrototype: {
        UPPER_STRAP: 'einkBw',
        WATCH: 'watchGearS3',
        LOWER_STRAP: 'einkBw',
    }
}

class Main {

    _identifier = idMain;
    _curApp;
    _nextApp;
    _availApps;
    _socket;
    _surfaces = {};
    _surfacesLastUpdate = {};
    _surfacesTimer = {};
    _curSetup = 'einkPrototype';

    appContainer;

    constructor() {
        this._availApps = [
            MusicPlayer,
            ActivityTracker,
            MoodBand,
            MapFinder,
            FinanceData,
            PublicTransport,
            PatternBand,
            FlashLight,
            FriendlyReminder,
            TestApp
        ];

        this.connectToServer();

        this.appContainer = document.querySelector('#appContainer');
        document.addEventListener('intent', (i) => this.onIntent(i));
    }

    clearCurApp() {
        while (this.appContainer.firstChild)
            this.appContainer.removeChild(this.appContainer.firstChild);
        this._surfaces = {};
        this._curApp = undefined;
    }

    connectToServer(ip) {
        if (this._socket)
            this._socket.close();

        this._socket = window.io(ip);

        this._socket.on('connect', () => {
            this._socket.emit('handshake', this._identifier);
        });

        this._socket.on('handshake', () => this.initFrontEnd());
        this._socket.on('redirect', remoteAddress => this.connectToServer(remoteAddress));

        this._socket.on('err', e => this.onMsgError(e));
        this._socket.on('msg', msg => this.onMsg(msg));
        this._socket.on('info', msg => this.onInfo(msg));
    }

    dispatchBezelEvent(event) {
        if (this._curApp)
            this._curApp.onBezelRotate(event);
    }

    dispatchHwkeyEvent(event) {
        if (this._curApp)
            this._curApp.onHwkey(event);
    }

    dispatchSoftPotTouch(surId, event) {
        let surface = this._surfaces[surId];
        if (!this._curApp || !surface)
            return;

        let xPos = (x) => { return (surface.width / 4 * x) }
        let yPos = (y) => { return (1 - (y / 1023)) * surface.height}
        let canvas = surface.document.getElementsByTagName('canvas')[0];
        let newEvent = surface.document.createEvent('MouseEvent');

        let type;
        switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;
            case "touchend":   type = "mouseup";   break;
            default:           return;
        }

        newEvent.initMouseEvent(type, true, true, surface.document.defaultView, 0,
            xPos(event.pos.x), yPos(event.pos.y), xPos(event.pos.x), yPos(event.pos.y), false, false, false, false, 0, canvas
        );

        canvas.dispatchEvent(newEvent);
        console.debug(`dispatched event ${event.type} as ${type}:`, event, newEvent);
    }

    dispatchTouchEvent(surId, event) {
        let surface = this._surfaces[surId];
        if (!this._curApp || !surface)
            return;

        let canvas = surface.document.getElementsByTagName('canvas')[0];
        let newEvent = surface.document.createEvent('MouseEvent');

        let type;
        switch(event.type)
        {
            case "touchstart": type = "mousedown"; break;
            case "touchmove":  type = "mousemove"; break;
            case "touchend":   type = "mouseup";   break;
            default:           return;
        }

        newEvent.initMouseEvent(type, true, true, surface.document.defaultView, 0,
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
                <script src='js/d3.v5.min.js'></script>
                <script src='js/ssvg.js'></script>
            </head>
            <body style='margin:0; overflow:hidden;'>
                <svg id='surfaceSvg' height='${d.height}' width='${d.width}'></svg>
            </body>`;
    }

    initFrontEnd() {
        let now = Date.now();
        this._surfacesLastUpdate[idWatch] = now;
        this._surfacesLastUpdate[idLowerStrap] = now;
        this._surfacesLastUpdate[idUpperStrap] = now;

        if (localStorage.getItem('debug-setup'))
            this._curSetup = localStorage.getItem('debug-setup');

        let setupSelect = document.getElementById('debug-setup');
        for (let setup in setups) {
            let opt = document.createElement('option');
            opt.value = setup;
            opt.innerHTML = setup;
            if (setup === this._curSetup)
                opt.selected = 'selected';
            setupSelect.appendChild(opt);
        }
        setupSelect.addEventListener('change', () => this.onSetupChange());

        // Load values from debug inputs / local storage; register listener
        let debugInputs = document.getElementById('debug').getElementsByTagName('input');
        for (let debugInput of debugInputs) {
            if (localStorage.getItem(debugInput.id))
                debugInput.value = localStorage.getItem(debugInput.id);
            debugInput.addEventListener('change', () => Main.onDebugUpdate(debugInput));
        }

        // Register listener for watch hardware events simulators
        document.getElementById('debug-bezelrotate-cw').addEventListener('click',
            () => this.dispatchBezelEvent({direction: "CW", type: "bezelrotate"}));
        document.getElementById('debug-bezelrotate-ccw').addEventListener('click',
            () => this.dispatchBezelEvent({direction: "CCW", type: "bezelrotate"}));
        document.getElementById('debug-hwkey-back').addEventListener('click',
            () => this.dispatchHwkeyEvent({key: "back", type: "hwkey"}));
        document.getElementById('debug-clear-lostrap').addEventListener('click',
            () => this.onClearEinkSurface(idLowerStrap));
        document.getElementById('debug-clear-upstrap').addEventListener('click',
            () => this.onClearEinkSurface(idUpperStrap));

        // Check for noSsvg URL flag; update indicator
        let noSsvg = (new URL(window.location.href)).searchParams.get("noSsvg");
        if (noSsvg !== null) {
            let debugElem = document.getElementById('ssvg-debug');
            debugElem.innerHTML = "SSVG: inactive";
            debugElem.classList = "off";
        }

        this.loadApp(Drawer);
    }

    loadApp(app) {
        if (this._curApp)
            this.clearCurApp();

        this._nextApp = app;

        this.loadSurfaces(setups[this._curSetup]);

        let debugInputs = document.getElementById('debug').getElementsByTagName('input');
        for (let debugInput of debugInputs) {
            Main.onDebugUpdate(debugInput);
        }

    }

    loadSurfaces(displayIds) {
        if (Object.keys(displayIds).length !== 3)
            throw Error('wrong number of display ids, expected 3');

        for (let surId in displayIds) {
            let d = displayConfigs[displayIds[surId]];
            let skeleton = Main.generateSurfaceSkeleton(displayIds[surId]);
            new Surface(surId, d, this.appContainer, skeleton, (this.onSurfaceLoaded).bind(this));
        }
    }

    static onDebugUpdate(input) {
        // HELPER
        let updateCon = (x, y, scale) => {
            document.getElementById('appContainer').style.transform = `rotate(90deg) translate(${y}px, ${x}px) scale(${scale})`;
        }

        switch (input.id) {
            case "debug-overall-scale":
                updateCon(
                    document.getElementById('debug-overall-x').value,
                    document.getElementById('debug-overall-y').value,
                    input.value);
                break;
            case "debug-overall-x":
                updateCon(
                    input.value,
                    document.getElementById('debug-overall-y').value,
                    document.getElementById('debug-overall-scale').value);
                break;
            case "debug-overall-y":
                updateCon(
                    document.getElementById('debug-overall-x').value,
                    input.value,
                    document.getElementById('debug-overall-scale').value);
                break;
            case "debug-spacing":
                document.getElementById(idUpperStrap + "-surface").style.transform = `translate(0, -${input.value}px) rotate(180deg)`;
                document.getElementById(idLowerStrap + "-surface").style.transform = `translate(0, ${input.value}px)`;
                break;
        }

        localStorage.setItem(input.id, input.value);
    }

    onIntent(intent) {
        switch(intent.detail.type) {
            case 'app':
                this.loadApp(intent.detail.app);
                break;
            case 'close':
                this.loadApp(Drawer);
                break;
        }
        
    }

    onInfo(msg) {
        if(!msg.type)
            return;

        switch (msg.type) {
            case 'connect':
                console.debug('device connected:', msg.identifier);
                if (this._surfaces[msg.identifier] && this._surfaces[msg.identifier].imageFormat === 'bitarray')
                    this._surfaces[msg.identifier].converting.pendingFullRefresh = true;
                this.onSurfaceUpdate(msg.identifier);
                break;
            case 'disconnect':
                console.debug('device disconnected:', msg.identifier);
                break;
        }
    }

    onMsgError(e) {
        console.warn("error", e);
    }

    onMsg(msg) {
        if (!msg.type)
            return;

        switch (msg.type) {
            case 'touch':
                this.dispatchTouchEvent(msg.sender, msg.payload);
                break;
            case 'softpottouch':
                this.dispatchSoftPotTouch(msg.sender, msg.payload);
                break;
            case 'bezelrotate':
                this.dispatchBezelEvent(msg.payload);
                break;
            case 'hwkey':
                this.dispatchHwkeyEvent(msg.payload);
                break;
        }
    }

    onSetupChange() {
        let selectedSetup = document.getElementById('debug-setup').value;
        if (selectedSetup !== this._curSetup) {
            this._curSetup = selectedSetup;
            this.loadApp(this._nextApp);
            localStorage.setItem('debug-setup', selectedSetup);
        }
    }

    onSurfaceLoaded(surId, surface) {
        this._surfaces[surId] = surface;
        let noSsvg = (new URL(window.location.href)).searchParams.get("noSsvg");
        if (noSsvg === null)
            new surface.window.SSVG({
                onDrawn: () => this.onSurfaceUpdate(surId)
            });

        if (Object.keys(this._surfaces).length === 3 && !this._curApp) {
            if (this._nextApp === Drawer) {
                this._curApp = new this._nextApp(
                    this._surfaces[idWatch],
                    this._surfaces[idLowerStrap],
                    this._surfaces[idUpperStrap],
                    this._availApps
                );
            } else {
                this._curApp = new this._nextApp(
                    this._surfaces[idWatch],
                    this._surfaces[idLowerStrap],
                    this._surfaces[idUpperStrap]
                );
            }
        }
    }

    onClearEinkSurface(surId) {
        if (surId !== idLowerStrap && surId !== idUpperStrap) return;

        let surface = this._surfaces[surId];
        if (surface.imageFormat === 'bitarray') {
            let canvas = surface.document.getElementsByTagName('canvas')[0];
            let imgData = canvas.toDataURL("image/jpeg", 1);
            let msgClear = {
                target: surId,
                type: 'imageData',
                size: {
                    width: surface.width,
                    height: surface.height
                },
                refresh: 'full',
                clear: true,
                dithering: surface.converting.dithering,
                invert: surface.converting.invert,
                payload: imgData
            };

            let msg = {
                target: surId,
                type: 'imageData',
                size: {
                    width: surface.width,
                    height: surface.height
                },
                refresh: 'full',
                dithering: surface.converting.dithering,
                invert: surface.converting.invert,
                payload: imgData
            };
            surface.converting.pendingFullRefresh = false;
            this._socket.emit('convert', msgClear);
            setTimeout(() => this._socket.emit('convert', msg), 2000);
        }
    }

    onSurfaceUpdate(surId) {
        let surface = this._surfaces[surId];
        if (!surface)
            return;
        let lastUpdate = this._surfacesLastUpdate[surId];
        let timer = this._surfacesTimer[surId];
        let now = Date.now();
        if (now - lastUpdate <= surface.updateInterval && !timer) {
            this._surfacesTimer[surId] = setTimeout(() => {
                this._surfacesTimer[surId] = undefined;
                this.onSurfaceUpdate(surId);
            }, surface.updateInterval);
            return;
        } else if (timer)
            return;

        setTimeout(() => {
            if (!surface)
                return;
            let canvas = surface.document.getElementsByTagName('canvas')[0];
            if (surface.imageFormat === 'bitarray') {
                let imgData = canvas.toDataURL("image/jpeg", 1);
                let msg = {
                    target: surId,
                    type: 'imageData',
                    size: {
                        width: surface.width,
                        height: surface.height
                    },
                    refresh: surface.converting.pendingFullRefresh ? 'full' : 'part',
                    dithering: surface.converting.dithering,
                    invert: surface.converting.invert,
                    payload: imgData
                };
                surface.converting.pendingFullRefresh = false;
                this._socket.emit('convert', msg);
            } else if (surface.imageFormat === 'jpeg') {
                let imgData = canvas.toDataURL("image/jpeg", 0.6);
                let msg = {
                    target: surId,
                    type: 'imageData',
                    payload: imgData
                };
                this._socket.emit('msg', msg);
            }
            this._surfacesLastUpdate[surId] = Date.now();
        }, 20);
    }
}
new Main();
