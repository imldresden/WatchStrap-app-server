import App from "./app.mjs";

export default class MapFinder extends App{
    static name = "Map Finder";
    static description = "Navigation & Maps";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this._staticConLoStrap = this._loStrap.svg.append('g').attr('id', 'statiConLoStrap');
        this.initApp();
    }

    initApp() {
        this._watch.svg.append('image')
            .attr("href", '/assets/map-finder/route_hawaii.jpg')
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', 360)
            .attr('width', 360);

        this._staticConLoStrap.append('image')
            .attr("href", '/assets/map-finder/left.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', this._loStrap.width * .1)
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._staticConLoStrap.append('text')
            .text('190')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large'))
            .style('font', this._loStrap.font('large'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._staticConLoStrap.append('text')
            .text('meter')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') * 2)
            .style('font', this._loStrap.font('normal'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._staticConLoStrap.append('image')
            .attr("href", '/assets/map-finder/right.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', this._loStrap.width * .1 + this._loStrap.width * .6)
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._staticConLoStrap.append('text')
            .text('2.6')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') + this._loStrap.width * .6)
            .style('font', this._loStrap.font('large'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._staticConLoStrap.append('text')
            .text('km')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') * 2 + this._loStrap.width * .6)
            .style('font', this._loStrap.font('normal'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._staticConLoStrap.append('image')
            .attr("href", '/assets/map-finder/up.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', this._loStrap.width * .1 + this._loStrap.width * 1.2)
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._staticConLoStrap.append('text')
            .text('6.0')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') + this._loStrap.width * 1.2)
            .style('font', this._loStrap.font('large'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);
        this._staticConLoStrap.append('text')
            .text('km')
            .attr('x', this._loStrap.width * .55)
            .attr('y', this._loStrap.width * .1 + this._loStrap.fontSize('large') * 2 + this._loStrap.width * 1.2)
            .style('font', this._loStrap.font('normal'))
            .attr('fill', 'white')
            .attr('height', this._loStrap.width * .3)
            .attr('width', this._loStrap.width * .3);

        this._staticConLoStrap.append('rect')
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', this._loStrap.colorMode === 'bw' ? this._loStrap.fontSize('normal') * 12.2 : this._loStrap.fontSize('normal') * 12)
            .attr('width', this._loStrap.width * 0.9)
            .attr('height', this._loStrap.fontSize('normal') * 1.75)
            .attr('fill', this._loStrap.colorMode === 'bw' ? 'white' : 'none')
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'none' : 'deepskyblue');
            
        this._staticConLoStrap.append('text')
            .text("Start")
            .attr('text-anchor', 'middle')
            .attr('x', this._loStrap.width / 2)
            .style('font', this._loStrap.font('small', 'bold'))
            .attr('y', this._loStrap.colorMode === 'bw' ? this._loStrap.fontSize('normal') * 13.3 : this._loStrap.fontSize('normal') * 13.3)
            .attr("fill", this._loStrap.colorMode === 'bw' ? 'black' : 'white');

        this._staticConLoStrap.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('fill-opacity', 0)
            .on('mousedown', () => {
                this.initNavigation();
            });
    }

    initNavigation() {
        this._loStrap.converting.pendingFullRefresh = true;
        this._staticConLoStrap.remove();
        this._staticConLoStrap = this._loStrap.svg.append('g').attr('id', 'statiConLoStrap');

        this._arrow = this._staticConLoStrap.append('path')
            .attr('fill', 'white');
        let arrowLeft = () => {
            this._arrow.attr('d', 'M 5 40 L 25 10 L 25 25 L 74 25 L 74 55 L 25 55 L 25 70 Z');
        }
        let arrowRight = () => {
            this._arrow.attr('d', 'M 99 40 L 79 10 L 79 25 L 30 25 L 30 55 L 79 55 L 79 70 Z');
        }
        arrowLeft();
        let left = true;

        let rects = [];
        for (let i = 0; i < 8; i++) {
            rects.push(this._staticConLoStrap.append('rect')
                .attr('x', 30)
                .attr('y', 65 + 18 * i)
                .attr('width', 44)
                .attr('height', 10)
                .attr('fill', 'white'));
        }

        let i = 0;
        let update = () => {
            if (i === 8) {
                i++;
            } else if (i > 8) {
                if (left) {
                    arrowRight();
                    left = false;
                } else {
                    arrowLeft();
                    left = true;
                }
                for (let j = 0; j < rects.length; j++) {
                    rects[j].attr('fill', 'white');
                }
                i = 0;
            } else {
                rects[rects.length - i - 1].attr('fill', 'none');
                i++;
            }
            this._timeOut = setTimeout(() => update(), 1500);
        };

        this._timeOut = setTimeout(() => update(), 1500);
    }

    onHwkey(e) {
        if (e.key === "back") {
            if (this._timeOut)
                clearTimeout(this._timeOut);
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}