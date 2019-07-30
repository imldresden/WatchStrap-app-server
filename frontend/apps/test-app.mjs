import App from "./app.mjs";

export default class TestApp extends App {
    static name = "Test App";
    static description = "Test showing some colorful bars";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this.curSelect = 0;
        this.data = [5, 10, 8, 8, 6, 7, 10, 5, 4, 2, 8];
        

        this.colors = [];
        
        for (let i in this.data) {
            this.colors[i] = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}`;
        }

        this.initApp();
    }

    initApp () {
        const watchD3 = this._watch.d3;
        const loStrapD3 = this._loStrap.d3;
        const upStrapD3 = this._upStrap.d3;

        let watch = watchD3.select('svg');
        let watchWidth = +watch.attr("width"),
            watchHeight = +watch.attr("height");

        watch.append('text')
            .text('Bar # 1, value: ' + this.data[0])
            .attr('text-anchor', 'middle')
            .attr('x', watchWidth / 2)
            .attr('y', watchHeight / 2)
            .attr("fill", "white");


        let loStrap = loStrapD3.select('svg');
        let loStrapWidth = loStrap.attr('width');
        let loStrapHeight = loStrap.attr('height');
        let bars = loStrap.selectAll('rect')
            .data(this.data);

        bars.enter()
            .append('rect')
            .attr('width', (d) => { return d * (loStrapWidth / 10); } )
            .attr('height', (loStrapHeight / this.data.length) - 5)
            .style("fill", (d, i) => { return this.colors[i]; })
            .style("stroke", (d, i) => { return i === 0 ? "white" : "none"; })
            .attr('x', 0)
            .attr('y', (d, i) => { return i * (loStrapHeight / this.data.length); })
            .on('mousedown', (d, i) => {
                loStrap.selectAll('rect').style('stroke', 'none');
                let elem = loStrapD3.selectAll('rect').filter((d1, i1) => { return i1 === i; });
                elem.style("fill", this.colors[i]);
                elem.style("stroke", "white");
                watch.select('text').text('Bar #' + (i + 1) + ', value: ' + d);
                upStrap.select('rect').style("fill", this.colors[i]);
                this.curSelect = i;
            });

        let upStrap = upStrapD3.select('svg');
        upStrap.append('rect')
            .attr('width', upStrap.attr('width'))
            .attr('height', upStrap.attr('height'))
            .attr('x', 0)
            .attr('y', 0)
            .style('fill', this.colors[0]);
    }

    onBezelRotate(e) {
        if (e.direction === "CW" && this.curSelect < this.data.length - 2) {
            this.curSelect += 1;
        } else if (e.direction === "CCW" && this.curSelect >= 1) {
            this.curSelect -= 1;
        }
        this._loStrap.svg.selectAll('rect').style('stroke', 'none');
        this._loStrap.svg.selectAll('rect').filter((d, i) => { return i === this.curSelect; })
            .style("stroke", "white");
        this._watch.svg.select('text').text('Bar #' + (this.curSelect + 1) + ', value: ' + this.data[this.curSelect]);
        this._upStrap.svg.select('rect').style("fill", this.colors[this.curSelect]);
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}