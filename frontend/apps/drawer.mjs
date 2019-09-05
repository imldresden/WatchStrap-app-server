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

        this._scrollStepSize = {
            loStrap: 0,
            watch: 0
        }

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
            .attr('y', (d, i) => (this._watch.height / 2) + 20 + this._watch.height * i)
            .attr("fill", 'white');  
        
        watchCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .text((d) => d.description)
            .attr('text-anchor', 'middle')
            .style('font', '20px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', (d, i) => (this._watch.height / 2) + 60 + this._watch.height * i)
            .attr("fill", 'white');

        watchCon.append('g').selectAll('image')
            .data(this._apps)
            .enter().append('image')
            .attr("href", (d) => '/assets/' + d.name.toLowerCase().replace(" ", "-") + '/favicon.png')
            .attr('x', this._watch.width / 2 - this._watch.width * 0.075)
            .attr('y', (d, i) => this._watch.width * 0.25 + this._watch.height * i)
            .attr('height', this._watch.width * 0.15)
            .attr('width', this._watch.width * 0.15);

        this._scrollStepSize.watch = (this._watch.height / 2) + 40;

        let loStrapCon = this._loStrap.svg.append('g')
            .attr('id', 'loStrapCon')
            .attr('transform', 'translate(0, -0)');
        
        let stepSize = this._loStrap.fontSize('normal') * 4;
        loStrapCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .attr('id', (d) => 'loBtn-' + d.id)
            .text((d) => d.name.split(" ")[0])
            .attr('text-anchor', 'left')
            .attr('x', this._loStrap.width * .4)
            .style('font', this._loStrap.font('normal'))
            .attr('y', (d, i) => (i - 1) * stepSize + this._loStrap.fontSize('normal') * 2.2)
            .attr("fill", 'white');

        loStrapCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .attr('id', (d) => 'loBtn2-' + d.id)
            .text((d) => d.name.split(" ")[1])
            .attr('text-anchor', 'left')
            .attr('x', this._loStrap.width * .4)
            .style('font', this._loStrap.font('normal'))
            .attr('y', (d, i) => (i - 1) * stepSize + this._loStrap.fontSize('normal') * 2.2 + (this._loStrap.fontSize('normal') * 1.4))
            .attr("fill", 'white');

        loStrapCon.append('g').selectAll('image')
            .data(this._apps)
            .enter().append('image')
            .attr("href", (d) => '/assets/' + d.name.toLowerCase().replace(" ", "-") + '/favicon.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', (d, i) => (i - 1) * stepSize + this._loStrap.fontSize('normal') * 1.5)
            .attr('height', this._loStrap.width * .2)
            .attr('width', this._loStrap.width * .2);

        this._loStrap.svg.append('g').selectAll('rect')
            .data(this._apps)
            .enter().append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => (i) * stepSize)
            .attr('height', stepSize)
            .attr('width', this._loStrap.width)
            .attr('stroke-opacity', 0)
            .attr('fill-opacity', 0)
            .on('mousedown', (d, i) => {
                let index = this._curFocus + 1 + i;
                if (index >= this._apps.length)
                    return;

                // Start app
                let appIntent = new CustomEvent('intent', {
                    detail: {
                        type: 'app',
                        app: this._apps[index]
                    }});
                document.dispatchEvent(appIntent);
            });

        this._scrollStepSize.loStrap = stepSize;

        let upStrapCon = this._upStrap.svg.append('g')
            .attr('id', 'upStrapCon')
            .attr('transform', 'translate(0, 0)' );

        upStrapCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .attr('id', (d) => 'loBtn-' + d.id)
            .text((d) => d.name.split(" ")[0])
            .attr('text-anchor', 'left')
            .attr('x', this._loStrap.width * .4)
            .style('font', this._upStrap.font('normal'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', (d, i) => (i) * stepSize + this._upStrap.fontSize('normal') * 2.2)
            .attr("fill", 'white');

        upStrapCon.append('g').selectAll('text')
            .data(this._apps)
            .enter().append('text')
            .attr('id', (d) => 'loBtn2-' + d.id)
            .text((d) => d.name.split(" ")[1])
            .attr('text-anchor', 'left')
            .attr('x', this._loStrap.width * .4)
            .style('font', this._upStrap.font('normal'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', (d, i) => (i) * stepSize + this._upStrap.fontSize('normal') * 2.2 + (this._upStrap.fontSize('normal') * 1.4))
            .attr("fill", 'white');

        upStrapCon.append('g').selectAll('image')
            .data(this._apps)
            .enter().append('image')
            .attr("href", (d) => '/assets/' + d.name.toLowerCase().replace(" ", "-") + '/favicon.png')
            .attr('x', this._loStrap.width * .1)
            .attr('y', (d, i) => (i) * stepSize + this._upStrap.fontSize('normal') * 1.5)
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('height', this._loStrap.width * .2)
            .attr('width', this._loStrap.width * .2);

        this._upStrap.svg.append('g').selectAll('rect')
            .data(this._apps)
            .enter().append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => (i) * stepSize)
            .attr('height', stepSize)
            .attr('width', this._loStrap.width)
            .attr('stroke-opacity', 0)
            .attr('fill-opacity', 0)
            .on('mousedown', (d, i) => {
                let index = this._curFocus - i - 1;
                if (index >= this._apps.length)
                    return;

                // Start app
                let appIntent = new CustomEvent('intent', {
                    detail: {
                        type: 'app',
                        app: this._apps[index]
                    }});
                document.dispatchEvent(appIntent);
            });

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
            oldFocus * -this._scrollStepSize.loStrap,
            this._curFocus * -this._scrollStepSize.loStrap);

        let upStrapInter = this._upStrap.d3.interpolateNumber(
            oldFocus * this._scrollStepSize.loStrap + this._upStrap.height * 0.05,
            this._curFocus * this._scrollStepSize.loStrap + this._upStrap.height * 0.05);
        
        let t = this._watch.d3.timer((elapsed) => {
            if (elapsed > 500) {
                t.stop();
                this._watch.svg.select('#watchCon').attr('transform', 'translate(0, ' + watchInter(1) + ')');
                if (this._loStrap.type !== 'eink')
                    this._loStrap.svg.select('#loStrapCon').attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
                if (this._upStrap.type !== 'eink')
                    this._upStrap.svg.select('#upStrapCon').attr('transform', 'translate(0, ' + upStrapInter(1) + ')');
                return;
            }
            this._watch.svg.select('#watchCon')
                .attr('transform', 'translate(0, ' + watchInter(elapsed / 500) + ')');
            if (this._loStrap.type !== 'eink')
                this._loStrap.svg.select('#loStrapCon').attr('transform', 'translate(0, ' + loStrapInter(elapsed / 500) + ')');
            if (this._upStrap.type !== 'eink')
                this._upStrap.svg.select('#upStrapCon').attr('transform', 'translate(0, ' + upStrapInter(elapsed / 500) + ')');
        })

        if (this._upStrap.type === 'eink')
            this._loStrap.svg.select('#loStrapCon').attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
        if (this._upStrap.type === 'eink')
            this._upStrap.svg.select('#upStrapCon').attr('transform', 'translate(0, ' + upStrapInter(1) + ')');
    }
}

/* call onbezelrotate and onhwkey from main (this._curApp.onBezelRotate(e)) */