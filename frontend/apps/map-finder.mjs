import App from "./app.mjs";

export default class MapFinder extends App{
    static name = "Map Finder";
    static description = "Navigation & Maps";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

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
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large'))
            .style('font', this._loStrap.font('large'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('meter')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') * 2)
            .style('font', this._loStrap.font('normal'))
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
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') + this._loStrap.width * .6)
            .style('font', this._loStrap.font('large'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('km')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') * 2 + this._loStrap.width * .6)
            .style('font', this._loStrap.font('normal'))
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
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') + this._loStrap.width * 1.2)
            .style('font', this._loStrap.font('large'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._loStrap.svg.append('text')
            .text('km')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') * 2 + this._loStrap.width * 1.2)
            .style('font', this._loStrap.font('normal'))
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