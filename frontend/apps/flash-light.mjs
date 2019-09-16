import App from "./app.mjs";

export default class FlashLight extends App{
    static name = "Flash Light";
    static description = "Your little helper at night";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this.initApp();
    }

    initApp() {
        let isOn = false;
        let img = this._watch.svg.append('image')
            .attr('href', '/assets/flash-light/favicon.png')
            .attr('x', 100)
            .attr('y', 100)
            .attr('width', 160)
            .attr('height', 160);

        let rect = this._upStrap.svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._upStrap.width)
            .attr('height', this._upStrap.height)
            .attr('fill', 'none');

        let onClick = () => {
            if (isOn) {
                img.attr('href', '/assets/flash-light/favicon.png');
                rect.attr('fill', 'none');
            } else {
                rect.attr('fill', 'white');
                img.attr('href', '/assets/flash-light/flash_blue.png');               
            }
            isOn = !isOn;
        };

        this._loStrap.svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('fill', 'none')
            .on('mousedown', () => onClick());

        this._watch.svg.append('rect')
            .attr('width', 360)
            .attr('height', 360)
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', 'none')
            .on('mousedown', () => onClick());
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}