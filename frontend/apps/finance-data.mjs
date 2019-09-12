import App from "./app.mjs";

export default class FinanceData extends App{
    static name = "Finance Data";
    static description = "Keep Track of your Stocks.";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this.initApp();
    }

    initApp() {
        this._watch.d3.csv('/assets/finance-data/chart.csv')
            .then((d) => { this.initStockData(d); });
    }

    calcDayOffset(days) {
        return days * 86400000;
    }

    initStockData(data) {
        let minDate = this._watch.d3.min(data, (d) => (new Date(d["Date"])).getTime());
        let maxDate = this._watch.d3.max(data, (d) => (new Date(d["Date"])).getTime());

        let domainLoStrap = [minDate, minDate + this.calcDayOffset(this._loStrap.height)];
        let domainWatch = [domainLoStrap[1], minDate + this.calcDayOffset(this._loStrap.height + 90)];
        let domainUpStrap = [domainWatch[1], minDate + this.calcDayOffset(this._loStrap.height + 90 + this._upStrap.height)]        

        let minDateWatch = new Date(domainWatch[0]);
        let maxDateWatch = new Date(domainWatch[1]);
        let dateToString = (date) => {
            return date.toISOString().split("T")[0];
        }
        let minDataPoint = data.find((d) => d["Date"] === dateToString(minDateWatch));
        let maxDataPoint = data.find((d) => d["Date"] === dateToString(maxDateWatch));
        
        let watchData = data.slice(data.indexOf(minDataPoint), data.indexOf(maxDataPoint));
        
        


        let xLoStrap = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.height, 0]);
        xLoStrap.domain(domainLoStrap);

        let xWatch = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.height, 0]);
        xWatch.domain(domainWatch);

        let xUpStrap = this._loStrap.d3.scaleLinear()
            .rangeRound([0, this._upStrap.height]);
        xUpStrap.domain(domainUpStrap);

        let yLoStrap = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.width * 0.95, this._loStrap.width * 0.05]);
        yLoStrap.domain([this._loStrap.d3.min(data, (d) => d["Close"]), this._loStrap.d3.max(data, (d) => d["Close"])]);
        
        let yUpStrap = this._upStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.width * 0.05, this._loStrap.width * 0.95]);
        yUpStrap.domain([this._loStrap.d3.min(data, (d) => d["Close"]), this._loStrap.d3.max(data, (d) => d["Close"])]);

        let yWatch = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.width / 2 + ((this._loStrap.width * 0.95) / 2), this._watch.width / 2 - ((this._loStrap.width * 0.95) / 2)]);
        yWatch.domain([this._watch.d3.min(watchData, (d) => d["Close"]), this._watch.d3.max(watchData, (d) => d["Close"])]);
        // yWatch.domain([this._watch.d3.min(data, (d) => d["Close"]), this._watch.d3.max(data, (d) => d["Close"])]);

        let totalMin = Number.parseFloat(this._loStrap.d3.min(data, (d) => Number.parseFloat(d["Close"])));
        let totalDiff = this._loStrap.d3.max(data, (d) => Number.parseFloat(d["Close"])) - totalMin;
        let totalSteps = totalDiff / 20;

        for (let i = 0; i < 21; i++) {
            this._loStrap.svg.append('line')
                .attr('x1', yLoStrap(totalMin + totalSteps * i))
                .attr('x2', yLoStrap(totalMin + totalSteps * i))
                .attr('y2', this._loStrap.height)
                .attr('y1', 0)
                .attr('stroke', 'rgb(255, 255, 255, 0.5');
            this._upStrap.svg.append('line')
                .attr('x1', yUpStrap(totalMin + totalSteps * i))
                .attr('x2', yUpStrap(totalMin + totalSteps * i))
                .attr('y2', this._upStrap.height)
                .attr('y1', 0)
                .attr('stroke', 'rgb(255, 255, 255, 0.5');
            this._watch.svg.append('line')
                .attr('x1', yWatch(totalMin + totalSteps * i))
                .attr('x2', yWatch(totalMin + totalSteps * i))
                .attr('y2', this._watch.height)
                .attr('y1', 0)
                .attr('stroke', 'rgb(255, 255, 255, 0.5');
        }

        for (let i = 2014; i <= 2019; i++) {
            this._loStrap.svg.append('line')
                .attr('x1', 0)
                .attr('x2', this._loStrap.width)
                .attr('y2', xLoStrap((new Date(i + "-01-01")).getTime()))
                .attr('y1', xLoStrap((new Date(i + "-01-01")).getTime()))
                .attr('stroke', 'rgb(255, 255, 255, 0.5');
            this._upStrap.svg.append('line')
                .attr('x1', 0)
                .attr('x2', this._upStrap.width)
                .attr('y2', xUpStrap((new Date(i + "-01-01")).getTime()))
                .attr('y1', xUpStrap((new Date(i + "-01-01")).getTime()))
                .attr('stroke', 'rgb(255, 255, 255, 0.5');
            this._watch.svg.append('line')
                .attr('x1', 0)
                .attr('x2', this._watch.height)
                .attr('y2', xWatch((new Date(i + "-01-01")).getTime()))
                .attr('y1', xWatch((new Date(i + "-01-01")).getTime()))
                .attr('stroke', 'rgb(255, 255, 255, 0.5');
        }

        let lineLoStrap = this._loStrap.d3.line()
            .x((d) => yLoStrap(d["Close"]))
            .y((d) => xLoStrap((new Date(d["Date"])).getTime()))
            .curve(this._loStrap.d3.curveLinear);

        this._loStrap.svg.append('path')
            .datum(data)
            .attr('d', lineLoStrap)
            .attr('fill', 'none')
            .attr('stroke', 'deepskyblue')
            .attr('stroke-width', 4);

        let lineWatch = this._watch.d3.line()
            .x((d) => yWatch(d["Close"]))
            .y((d) => xWatch((new Date(d["Date"])).getTime()))
            .curve(this._watch.d3.curveLinear);

        this._watch.svg.append('path')
            .datum(data)
            .attr('d', lineWatch)
            .attr('fill', 'none')
            .attr('stroke', 'deepskyblue')
            .attr('stroke-width', 4);

        let lineUpStrap = this._upStrap.d3.line()
            .x((d) => yUpStrap(d["Close"]))
            .y((d) => xUpStrap((new Date(d["Date"])).getTime()))
            .curve(this._upStrap.d3.curveLinear);

        this._upStrap.svg.append('path')
            .datum(data)
            .attr('d', lineUpStrap)
            .attr('fill', 'none')
            .attr('stroke', 'deepskyblue')
            .attr('stroke-width', 4);

        this._loStrap.svg.append('text')
            .text("MSCI World Index")
            .attr('x', 0)
            .attr('y', 40)
            .attr('transform', 'rotate(-90) translate(0, ' + this._loStrap.height * 0.975 + ')')
            .style('font', '40px Arial')
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text(dateToString(new Date(minDate)) + " to " + dateToString(new Date(maxDate)))
            .attr('x', 0)
            .attr('y', 40)
            .attr('transform', 'rotate(-90) translate(0, ' + this._loStrap.height * 0.55 + ')')
            .attr('text-anchor', 'left')
            .style('font', this._loStrap.font('normal'))
            .attr('fill', "white");

        // this._upStrap.svg.append('rect')
        //     .attr('x', 0)
        //     .attr('y', this._upStrap.height * 0.8)
        //     .attr('width', 120)
        //     .attr('height', this._upStrap.height * 0.2)
        //     .attr('fill', 'rgba(0, 0, 0, 1');

        this._upStrap.svg.append('text')
            .text("Min:")
            .attr('x', this._upStrap.height * 0.95 - 80)
            .attr('y', -60)
            .attr('transform', 'rotate(90) translate(0, 0)')
            .style('font', this._loStrap.font('normal'))
            .attr('text-anchor', 'right')
            .attr('fill', 'white');
        this._upStrap.svg.append('text')
            .text("$" + Number.parseFloat(this._loStrap.d3.min(data, (d) => d["Close"])).toFixed(2))
            .attr('x', this._upStrap.height * 0.95)
            .attr('y', -60)
            .attr('transform', 'rotate(90) translate(0, 0)')
            .style('font', this._loStrap.font('normal'))
            .attr('text-anchor', 'right')
            .attr('fill', 'indianred');

        this._upStrap.svg.append('text')
            .text("Max:")
            .attr('x', this._upStrap.height * 0.95 - 80)
            .attr('y', -100)
            .attr('transform', 'rotate(90) translate(0, 0)')
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('normal'))
            .attr('fill', 'white');
        this._upStrap.svg.append('text')
            .text("$" + Number.parseFloat(this._loStrap.d3.max(data, (d) => d["Close"])).toFixed(2))
            .attr('x', this._upStrap.height * 0.95)
            .attr('y', -100)
            .attr('transform', 'rotate(90) translate(0, 0)')
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('normal'))
            .attr('fill', 'limegreen');

        let diff = (data[data.length - 1]["Close"] / data[0]["Close"] - 1) * 100;

        this._upStrap.svg.append('text')
            .text("Change:")
            .attr('x', this._upStrap.height * 0.95 - 100)
            .attr('y', -20)
            .attr('transform', 'rotate(90) translate(0, 0)')
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('normal'))
            .attr('fill', "white");
        
        this._upStrap.svg.append('text')
            .text((diff > 0 ? "+" : "") + diff.toFixed(2) + "%")
            .attr('x', this._upStrap.height * 0.95)
            .attr('y', -20)
            .attr('transform', 'rotate(90) translate(0, 0)')
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('normal'))
            .attr('fill', diff > 0 ? 'limegreen' : "indianred");

        let date = dateToString(new Date(xWatch.invert(this._watch.width/2)));
        let value = data.find((d) => d["Date"] === date)["Close"];

        this._watch.svg.append('text')
            .text(date)
            .attr('x', -this._watch.width / 2)
            .attr('y', 50)
            .attr('transform', 'rotate(-90) translate(0, 0)')
            .attr('text-anchor', 'center')
            .style('font', this._watch.font('large'))
            .attr('fill',"white");
        this._watch.svg.append('text')
            .text("$" + Number.parseFloat(value).toFixed(2))
            .attr('x', -this._watch.width / 2)
            .attr('y', 120)
            .attr('transform', 'rotate(-90) translate(0, 0)')
            .attr('text-anchor', 'center')
            .style('font', '45px Arial')
            .attr('fill',"white");

        this._watch.svg.append('line')
            .attr('x1', yWatch(Number.parseFloat(value).toFixed(2)) - 110)
            .attr('y1', this._watch.height / 2)
            .attr('x2', yWatch(Number.parseFloat(value).toFixed(2)))
            .attr('y2', this._watch.height / 2)
            .attr('stroke', 'white')
            .attr('stroke-width', 4);
        this._watch.svg.append('circle')
            .attr('cx', yWatch(Number.parseFloat(value).toFixed(2)))
            .attr('cy', this._watch.height / 2)
            .attr('fill', 'white')
            .attr('r', 10);

        
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}