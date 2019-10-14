import App from "./app.mjs";

export default class PatternBand extends App{
    static name = "Pattern Band";
    static description = "Express yourself!";

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

        this.imgIndex = 0;
        this.maxIndex = 6;

        this.initApp();
    }

    initApp() {
        let totalHeight = this._loStrap.height + this._watch.height + this._upStrap.height;
        let scale = totalHeight / 2000
        this._watch.svg.append('image')
            .attr("href", '/assets/pattern-band/mood-' + this.imgIndex + '.jpg')
            .attr('x', -(1333 * scale / 2) + 180)
            .attr('y', -this._upStrap.height)
            .attr('height', totalHeight)
            .attr('width', 1333 * scale)
            .on('mousedown', () => { this.changeImage(); });

        this._loStrap.svg.append('image')
            .attr("href", '/assets/pattern-band/mood-' + this.imgIndex + '.jpg')
            .attr('x', -(1333 * scale / 2) + this._loStrap.width)
            .attr('y', -this._upStrap.height - this._watch.height)
            .attr('height', totalHeight)
            .attr('width', 1333 * scale)
            .on('mousedown', () => { this.changeImage(); });

        this._upStrap.svg.append('image')
            .attr("href", '/assets/pattern-band/mood-' + this.imgIndex + '.jpg')
            .attr('x', -(1333 * scale / 2) + this._upStrap.width)
            .attr('y', 0)
            .attr('height', totalHeight)
            .attr('width', 1333 * scale)
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', ' + (this._upStrap.height) + ')')
            .on('mousedown', () => { this.changeImage(); });

        this._upStrap.svg.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._upStrap.width)
            .attr('height', this._upStrap.height)
            .on('mousedown', () => { this.changeImage(); });

        if (this._loStrap.type === 'eink') {
            this._loStrap.converting.dithering = true;
            this._loStrap.converting.invert = false;
        }
        if (this._upStrap.type === 'eink') {
            this._upStrap.converting.dithering = true;
            this._upStrap.converting.invert = false;
        }

        document.addEventListener('hwkey', (e) => this.onHwkey(e));
    }

    changeImage() {
        if (this.imgIndex < this.maxIndex)
            this.imgIndex++;
        else
            this.imgIndex = 1;

        this._watch.svg.select('image')
            .attr("href", '/assets/pattern-band/mood-' + this.imgIndex + '.jpg');
        this._loStrap.svg.select('image')
            .attr("href", '/assets/pattern-band/mood-' + this.imgIndex + '.jpg');
        this._upStrap.svg.select('image')
            .attr("href", '/assets/pattern-band/mood-' + this.imgIndex + '.jpg');
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}