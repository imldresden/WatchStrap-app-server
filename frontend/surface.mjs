export default class Surface {
    
    _id;
    _displayConfig;
    _iframe;
    _parent;
    _onLoadedCallback;

    converting = {
        dithering: false,
        invert: true,
        pendingFullRefresh: false
    };

    _fontSize;
    _defaultFontFamily = 'Arial';
    _defaultFontFamilyBold = 'Arial Black';

    get id() { return this._id; }
    get width() { return this._displayConfig.width; }
    get height() { return this._displayConfig.height; }
    get type() { return this._displayConfig.type; }
    get colorMode() { return this._displayConfig.color; }
    get dpi() { return this._displayConfig.dpi; }
    get imageFormat() { return this._displayConfig.imageFormat; }
    get updateInterval() { return this._displayConfig.updateInterval; }
    get window() { return this._iframe.contentWindow; }
    get document() { return this.window.document; }
    get d3() { return this.window.d3; }
    get svg() { return this.d3.select('svg'); }

    constructor(id, displayConfig, parent, skeleton, onLoadedCallback) {
        this._id = id;
        this._displayConfig = displayConfig;
        this._parent = parent;
        this._onLoadedCallback = onLoadedCallback;

        this._iframe = this.generateIFrame();
        parent.appendChild(this._iframe);

        this.window.surId = id;
        
        this.document.open();
        this.document.write(skeleton);
        this.document.close();

        if (this.type === 'eink') {
            this.converting.pendingFullRefresh = true;
        }

        this._fontSize = {
            "LOWER_STRAP": {
                'small': this.dpi < 150 ? 11 : 18,
                'normal': this.dpi < 150 ? 15 : 24,
                'large': this.dpi < 150 ? 20 : 32
            },
            "UPPER_STRAP": {
                'small': this.dpi < 150 ? 11 : 18,
                'normal': this.dpi < 150 ? 15 : 24,
                'large': this.dpi < 150 ? 20 : 32
            },
            "WATCH": {
                'tiny': 14,
                'small': 18,
                'normal': 24,
                'large': 30
            }
        };

        this.window.onload = () => this._onLoadedCallback(id, this);
    }

    font(size, family) {
        let fontString;
        if (size) {
            if (typeof size === 'number') {
                fontString = size;
            } else {
                fontString = this._fontSize[this.id][size] ? this._fontSize[this.id][size] : this._fontSize[this.id].normal;
            }
        } else {
            fontString = this._fontSize[this.id].normal;
        }
        fontString = fontString + "px";

        if (family) {
            if (family === "bold")
                fontString = fontString + " " + this._defaultFontFamilyBold;
            else
                fontString = fontString + " " + family;
        } else
            fontString = fontString + " " + this._defaultFontFamily;

        return fontString;
    }

    fontSize(size) { return this._fontSize[this.id][size]; }

    generateIFrame() {
        let iframe = document.createElement('iframe');
        iframe.setAttribute('id', this.id + "-surface");
        iframe.setAttribute('width', this.width);
        iframe.setAttribute('height', this.height);

        return iframe;
    }
}