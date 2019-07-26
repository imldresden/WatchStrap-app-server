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
        let d3 = this.#watch.d3;
        let svg = d3.select('svg');

        let width = +svg.attr("width"),
            height = +svg.attr("height");

        let data = [5, 10, 8, 8];
        let bars = svg.selectAll('rect')
            .data(data);

        bars.enter()
            .append('rect')
            .attr('width', (width / 4) - 10)
            .attr('height', (d) => { return d * (height / 10); } )
            .style("fill", "blue")
            .attr('x', (d, i) => { return i * (width / 4); })
            .attr('y', 0)
            .on('mousedown', function(d, i) {
                let elem = d3.select(this);
                elem.style("fill", `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}`);
            });

    }
}