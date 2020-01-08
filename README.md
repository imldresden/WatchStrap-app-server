# AppServer for StrapDisplay Prototype

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
- to avoid accidential website zoom interaction on tablet prototype, start chrome with `chrome.exe --kiosk --disable-pinch --overscroll-history-navigation=0`