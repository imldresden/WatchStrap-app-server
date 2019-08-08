import App from "./app.mjs";

export default class MapFinder extends App{
    static name = "Map Finder";
    static description = "Navigation & Maps";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this._fontSize = {
            loStrap: {
                'small': loStrap.dpi < 150 ? 11 : 16,
                'normal': loStrap.dpi < 150 ? 15 : 22,
                'large': loStrap.dpi < 150 ? 18 : 26
            },
            upStrap: {
                'small': loStrap.dpi < 150 ? 10 : 16,
                'normal': loStrap.dpi < 150 ? 16 : 22
            },
            watch: {
                'small': 18,
                'normal': 24,
                'large': 30
            }
        }

        this.initApp();
    }

    initApp() {
        this._watch.svg.append('image')
            .attr("href", (d) => '/assets/map-finder/route_hawaii.jpg')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', 360)
            .attr('width', 360);

        this._loStrap.svg.append('image')
            .attr("href", (d) => '/assets/map-finder/up.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', this._loStrap.width * .1)
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._loStrap.svg.append('text')
            .text('190')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._fontSize.loStrap.large)
            .style('font', this._fontSize.loStrap.large + 2 + 'px sans-serif')
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('meter')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._fontSize.loStrap.large * 2)
            .style('font', this._fontSize.loStrap.normal + 'px sans-serif')
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._loStrap.svg.append('image')
            .attr("href", (d) => '/assets/map-finder/left.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', this._loStrap.width * .1 + this._loStrap.width * .6)
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._loStrap.svg.append('text')
            .text('2.6')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._fontSize.loStrap.large + this._loStrap.width * .6)
            .style('font', this._fontSize.loStrap.large + 2 + 'px sans-serif')
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('km')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._fontSize.loStrap.large * 2 + this._loStrap.width * .6)
            .style('font', this._fontSize.loStrap.normal + 'px sans-serif')
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._loStrap.svg.append('image')
            .attr("href", (d) => '/assets/map-finder/right.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', this._loStrap.width * .1 + this._loStrap.width * 1.2)
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('6.0')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._fontSize.loStrap.large + this._loStrap.width * 1.2)
            .style('font', this._fontSize.loStrap.large + 2 + 'px sans-serif')
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('km')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._fontSize.loStrap.large * 2 + this._loStrap.width * 1.2)
            .style('font', this._fontSize.loStrap.normal + 'px sans-serif')
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        document.addEventListener('hwkey', (e) => this.onHwkey(e));
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}