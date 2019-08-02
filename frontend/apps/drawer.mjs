import App from "./app.mjs";

export default class DrawerApp extends App {
    static name = "Drawer";
    static description = "Basic app drawer";

    _apps;
    _curFocus;

    constructor(watch, loStrap, upStrap, availApps) {
        super(watch, loStrap, upStrap);

        this._apps = availApps;
        this._curFocus = 0;

        this.initApp();
    }

    initApp () {
        let watchCon = this._watch.svg.append('g')
            .attr('id', 'watchCon');
            
        watchCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .style('font', '34px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', (d, i) => (this._watch.height / 2) - 20 + this._watch.height * i)
            .attr("fill", 'white');  
        
        watchCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .text((d) => d.description)
            .attr('text-anchor', 'middle')
            .style('font', '20px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', (d, i) => (this._watch.height / 2) + 40 + this._watch.height * i)
            .attr("fill", 'white');

        let loStrapCon = this._loStrap.svg.append('g')
            .attr('id', 'loStrapCon')
            .attr('transform', 'translate(0, -110)');
        
        let listLo = loStrapCon.selectAll('text')
            .data(this._apps);

        listLo.enter()
            .append('text')
            .attr('id', (d) => 'loBtn-' + d.id)
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .attr('x', this._loStrap.width / 2)
            .style('font', '24px sans-serif')
            .attr('y', (d, i) => (i + 1) * 100)
            .attr("fill", 'white');

        let upStrapCon = this._upStrap.svg.append('g')
            .attr('id', 'upStrapCon')
            .attr('transform', 'translate(0, ' + this._upStrap.height + ')' );
        
        let listUp = upStrapCon.selectAll('text')
            .data(this._apps);

        listUp.enter()
            .append('text')
            .attr('id', (d) => 'upBtn-' + d.id)
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .attr('x', this._upStrap.width / 2)
            .style('font', '24px sans-serif')
            .attr('y', (d, i) => (i + 1) * 100)
            .attr("fill", 'white');

        this._watch.svg.on("mousedown", () => {
            let appIntent = new CustomEvent('intent', {
                detail: {
                    type: 'app',
                    app: this._apps[this._curFocus]
                }});
            document.dispatchEvent(appIntent);
        })

    }

    onBezelRotate(e) {
        let oldFocus = this._curFocus;
        if (e.direction === "CW" && this._curFocus < this._apps.length - 1) {
            this._curFocus += 1;
        } else if (e.direction === "CCW" && this._curFocus >= 1) {
            this._curFocus -= 1;
        }

        let watchInter = this._watch.d3.interpolateNumber(
            -this._watch.height * oldFocus,
            -this._watch.height * this._curFocus);

        let loStrapInter = this._loStrap.d3.interpolateNumber(
            (oldFocus * -100) - 110,
            (this._curFocus * -100) - 110);

        let upStrapInter = this._upStrap.d3.interpolateNumber(
            this._upStrap.height - ((oldFocus * 100) + 80),
            this._upStrap.height - ((this._curFocus * 100) + 80));
        
        let t = this._watch.d3.timer((elapsed) => {
            if (elapsed > 500) {
                t.stop();
                this._watch.svg.select('#watchCon').attr('transform', 'translate(0, ' + watchInter(1) + ')');
                this._loStrap.svg.select('#loStrapCon').attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
                this._upStrap.svg.select('#upStrapCon').attr('transform', 'translate(0, ' + upStrapInter(1) + ')');
                return;
            }
            this._watch.svg.select('#watchCon')
                .attr('transform', 'translate(0, ' + watchInter(elapsed / 500) + ')');
            this._loStrap.svg.select('#loStrapCon')
                .attr('transform', 'translate(0, ' + loStrapInter(elapsed / 500) + ')');
            this._upStrap.svg.select('#upStrapCon')
                .attr('transform', 'translate(0, ' + upStrapInter(elapsed / 500) + ')');
            
        })
    }
}

/* call onbezelrotate and onhwkey from main (this._curApp.onBezelRotate(e)) */