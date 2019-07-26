export default class TestApp {
    #watch;
    #loStrap;
    #upStrap;

    constructor(watchWindow, lowerStrapWindow, upperStrapWindow) {
        this.#watch = watchWindow;
        this.#loStrap = lowerStrapWindow;
        this.#upStrap = upperStrapWindow;
        this.createVis();
    }

    createVis () {
        const watchD3 = this.#watch.d3;
        const loStrapD3 = this.#loStrap.d3;
        const upStrapD3 = this.#upStrap.d3;

        let data = [5, 10, 8, 8, 6, 7, 10, 5, 4, 2, 8];
        let colors = [];
        let curSelect = 0;
        for (let i in data) {
            colors[i] = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}`;
        }

        let watch = watchD3.select('svg');
        let watchWidth = +watch.attr("width"),
            watchHeight = +watch.attr("height");

        watch.append('text')
            .text('Bar # 1, value: ' + data[0])
            .attr('text-anchor', 'middle')
            .attr('x', watchWidth / 2)
            .attr('y', watchHeight / 2)
            .attr("fill", "white");


        let loStrap = loStrapD3.select('svg');
        let loStrapWidth = loStrap.attr('width');
        let loStrapHeight = loStrap.attr('height');
        let bars = loStrap.selectAll('rect')
            .data(data);

        bars.enter()
            .append('rect')
            .attr('width', (d) => { return d * (loStrapWidth / 10); } )
            .attr('height', (loStrapHeight / data.length) - 5)
            .style("fill", (d, i) => { return colors[i]; })
            .style("stroke", (d, i) => { return i === 0 ? "white" : "none"; })
            .attr('x', 0)
            .attr('y', (d, i) => { return i * (loStrapHeight / data.length); })
            .on('mousedown', function(d, i) {
                loStrap.selectAll('rect').style('stroke', 'none');
                let elem = loStrapD3.select(this);
                elem.style("fill", colors[i]);
                elem.style("stroke", "white");
                watch.select('text').text('Bar #' + (i + 1) + ', value: ' + d);
                upStrap.select('rect').style("fill", colors[i]);
                curSelect = i;
            });

        let upStrap = upStrapD3.select('svg');
        upStrap.append('rect')
            .attr('width', upStrap.attr('width'))
            .attr('height', upStrap.attr('height'))
            .attr('x', 0)
            .attr('y', 0)
            .style('fill', colors[0]);

        document.addEventListener('bezelrotate', (e) => {
            if (e.detail.direction === "CW" && curSelect < data.length - 2) {
                curSelect += 1;
            } else if (e.detail.direction === "CCW" && curSelect >= 1) {
                curSelect -= 1;
            }
            loStrap.selectAll('rect').style('stroke', 'none');
            loStrap.selectAll('rect').filter((d, i) => { return i === curSelect; })
                .style("stroke", "white");
            watch.select('text').text('Bar #' + (curSelect + 1) + ', value: ' + data[curSelect]);
            upStrap.select('rect').style("fill", colors[curSelect]);
        });
    }
}