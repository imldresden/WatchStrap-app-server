import App from "./app.mjs";

export default class SmartHome extends App{
    static name = "Smart Home";
    static description = "Control your own casa";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this.initApp();
    }

    initApp() {
        this._watch.svg.append('text')
            .text('Nothing here yet')
            .attr("text-anchor", "middle")
            .style('font', '26px sans-serif')
            .attr("fill", 'white')
            .attr("x", this._watch.width / 2)
            .attr("y", this._watch.height / 2);

        document.addEventListener('hwkey', (e) => this.onHwkey(e));
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}