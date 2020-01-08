# Watch+Strap Web Prototype

## Usage
Firstly, run
```
npm install
```

For production usage, please use
```
npm start
```
This will create a background process for running the server.

For debugging, there are two ways:
```
npm run-script debug-local
```
This starts the server locally; all communication happens via the local server.

```
npm run-script debug-remote
```
This starts the server as before, but redirects the clients to connect to a remote websocket server. The address is read from the `DEBUG_REMOTE_ADDRESS` property from the `.env` file (must be created manually). 

### Config
Right now, you can create a `.env` file for some a few simple configurations. Example:
```
PORT=31415
DEBUG_REMOTE_ADDRESS=127.0.0.1
```

## Hints
- **Currently, only the Chrome browser is supported**
- to avoid accidential website zoom interaction on tablet prototype, start chrome with `chrome.exe --kiosk --disable-pinch --overscroll-history-navigation=0`

## Development / Structure
**Server:** The server component is a nodeJS file that runs the websocket server as well as serves the frontend.
The server itself only forwards messages as well as supports some image data transformations for the eink displays.

**Frontend:** The application logic is placed in the frontend, mostly in the `main.mjs` file. The frontend must be opened on a computer in order to run the prototype!
The Main class receives the websocket messages from the watch as well as eink displays (forwarded by the server) and updates the application accordingly.

**Apps:** The prototype follows a lightweight app structure, which can be loaded via the drawer app.
These apps are implemented in ES module files (`.mjs`) and are children of the `APP` class (`app.mjs`).
The apps must be imported and added to the `_availApps` list in the constructor of the Main class (`main.mjs`).
When initialized, apps expect three Surfaces; within these surfaces SVG / D3.js can be used to implement the interface.

**Surfaces:** During run time, there are three surfaces, one for each display (watch, lower strap, upper strap).
Technically, each surface is a special object (see `surfaces.mjs`) and holds references to the respective iframe and its properties (e.g., document object, D3 instance, SVG element) as well as further properties describing the corresponding display (e.g., size, color mode, dpi).

**SSVG:** The SVG element of each surface is not drawn but mapped to a canvas object during runtime; this is done using the SSVG library.
While this happens almost transparently, SSVG does not support all D3/SVG features yet.
For more details, see [https://github.com/michaschwab/ssvg](https://github.com/michaschwab/ssvg).
