import App from "./app.mjs";

export default class ActivityTracker extends App{
    static name = "Activity Tracker";
    static description = "Track yourself and get better";

    static modes = {
        "overview": 0,
        "runStats": 1,
        "runDetails": 2,
        "tracking": 3
    };

    _runs;
    _curFocus;
    _curMode;
    _curRun;
    _scrollStepSizeLoStrap = 0;
    _curTimer;
    _timePassed;
    _fontSize;
    _url = "/assets/activity-tracker/runs/";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this._runs = [
            {
                id: "run_1",
                name: "Saturday Run",
                distance: 5.04,
                time: "24:27",
                avgPace: "4:51",
                avgHR: 178,
                elevGain: 5,
                date: "2019-08-17"
            },
            {
                id: "run_2",
                name: "Summer Run 2019",
                distance: 10.03,
                time: "47:49",
                avgPace: "4:46",
                avgHR: 174,
                elevGain: 53,
                date: "2019-07-14"
            },
            {
                id: "run_3",
                name: "TeamChallenge",
                distance: 5.01,
                time: "21:22",
                avgPace: "4:16",
                avgHR: 175,
                elevGain: 10,
                date: "2019-06-28"
            },
            {
                id: "run_4",
                name: "Morning Run",
                distance: 5.06,
                time: "22:22",
                avgPace: "4:25",
                avgHR: 148,
                elevGain: 13,
                date: "2019-06-24"
            },
            {
                id: "run_5",
                name: "Afternoon Run",
                distance: 7.45,
                time: "36:19",
                avgPace: "4:52",
                avgHR: 175,
                elevGain: 15,
                date: "2019-06-04"
            },
            {
                id: "run_6",
                name: "Evening Run",
                distance: 8.09,
                time: "38:31",
                avgPace: "4:46",
                avgHR: 170,
                elevGain: 16,
                date: "2019-05-19"
            },
        ]
        this._curFocus = 0;
        this._scrollStepSizeLoStrap;

        this._staticConUpStrap = this._upStrap.svg.append('g').attr('id', 'statiConUpStrap');
        this._backgroundWatch = this._watch.svg.append('g').attr('id', 'backgroundWatch');
        this._staticConWatch = this._watch.svg.append('g').attr('id', 'staticConWatch');
        this._scrollConWatch = this._watch.svg.append('g').attr('id', 'scrollConWatch');
        this._staticConLoStrap = this._loStrap.svg.append('g').attr('id', 'statiConLoStrap');
        this._scrollConLoStrap = this._loStrap.svg.append('g').attr('id', 'scrollConLoStrap');
        this._overlayLoStrap = this._loStrap.svg.append('g').attr('id', 'overlayLoStrap');

        this.initApp();
    }

    initApp() {
        this.initUpperStrap();
        this.initOverview();

        document.addEventListener('hwkey', (e) => this.onHwkey(e));
    }

    cleanInterface() {
        this._curFocus = 0;

        this._backgroundWatch.remove();
        this._staticConWatch.remove();
        this._scrollConWatch.remove();
        this._staticConLoStrap.remove();
        this._scrollConLoStrap.remove();
        this._overlayLoStrap.remove();

        this._backgroundWatch = this._watch.svg.append('g').attr('id', 'backgroundWatch');
        this._staticConWatch = this._watch.svg.append('g').attr('id', 'staticConWatch');
        this._scrollConWatch = this._watch.svg.append('g').attr('id', 'scrollConWatch');
        this._staticConLoStrap = this._loStrap.svg.append('g').attr('id', 'statiConLoStrap');
        this._scrollConLoStrap = this._loStrap.svg.append('g').attr('id', 'scrollConLoStrap');
        this._overlayLoStrap = this._loStrap.svg.append('g').attr('id', 'overlayLoStrap');
    }

    initUpperStrap() {

        this._staticConUpStrap.append('rect')
            .attr('x', this._upStrap.width * 0.05)
            .attr('y', -this._upStrap.height * 0.025)
            .attr('width', this._upStrap.width * 0.9)
            .attr('height', -this._upStrap.fontSize('normal') * 3)
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('fill', 'rgb(255,255,255')
            .style('fill-opacity', 0.5);

        this._staticConUpStrap.append('text')
            .text("Start")
            .attr('text-anchor', 'middle')
            .attr('x', this._upStrap.width / 2)
            .style('font', this._upStrap.font('normal', 'bold'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', -this._upStrap.height * .075 - this._upStrap.fontSize('normal') * 1.2)
            .attr("fill", 'black');

        this._staticConUpStrap.append('text')
            .text("New Activity")
            .attr('text-anchor', 'middle')
            .attr('x', this._upStrap.width / 2)
            .style('font', this._upStrap.font('small', 'bold'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', -this._upStrap.height * .075)
            .attr("fill", 'black');

        this._staticConUpStrap.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._upStrap.width)
            .attr('height', this._upStrap.height)
            .attr('fill-opacity', 0)
            .on('mousedown', () => {
                this.cleanInterface();
                this.loadTracking();
            });
            
    }

    initOverview() {        
        this.cleanInterface();
        this._curMode = ActivityTracker.modes.overview;

        let x = this._watch.d3.scaleBand()
            .rangeRound([this._watch.width * 0.8, 0]);
        
        let y = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.height / 2, 0]);

        x.domain(this._runs.map((d) => d.id));
        y.domain([0, this._watch.d3.max(this._runs, (d) => d.distance)]);

        this._backgroundWatch.append('g').selectAll('rect')
            .data(this._runs)
            .enter().append('rect')
            .attr('width', x.bandwidth())
            .attr('height', (d) => this._watch.height / 2 - y(d.distance))
            .attr('fill', 'deepskyblue')
            .attr('stroke', 'black')
            .attr('x', (d) => x(d.id) + this._watch.width * 0.1)
            .attr('y', (d) => y(d.distance) + this._watch.height / 2)
            .on('mousedown', (d) => {
                this.loadRunStats(d);
            });
        
        this._backgroundWatch.append('g').selectAll('text')
            .data(this._runs)
            .enter().append('text')
            .attr('fill', 'black')
            .attr('x', (d) => x(d.id) + this._watch.width * 0.1 + x.bandwidth() / 2)
            .attr('y', (d) => y(d.distance) + this._watch.height / 2 + this._watch.fontSize('tiny'))
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('tiny'))
            .text((d) => d.distance);

        this._staticConWatch.append('text')
            .text("You have")
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('normal'))
            .attr('x', this._watch.width / 2)
            .attr('y', 60)
            .attr("fill", 'white');
        
        this._staticConWatch.append('text')
            .text(this._runs.length + " Recent Activities")
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('large'))
            .attr('x', this._watch.width / 2)
            .attr('y', 100)
            .attr("fill", 'white');

        this._staticConWatch.append('text')
            .text('That are ' + this._runs.reduce((sum, run) => sum + run.distance, 0).toFixed(2) + " km in total!")
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('small'))
            .attr('x', this._watch.width / 2)
            .attr('y', 140)
            .attr("fill", 'white');

        this._scrollStepSizeLoStrap = this._loStrap.fontSize('normal') * 3.5

        this._scrollConLoStrap.append('g').selectAll('text')
            .data(this._runs)
            .enter().append('text')
            .text((d) => d.name)
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', (d, i) => i * this._scrollStepSizeLoStrap + this._loStrap.fontSize('normal') * 1.5)
            .style('font', this._loStrap.font('normal'))
            .attr("fill", 'white');

        this._scrollConLoStrap.append('g').selectAll('text')
            .data(this._runs)
            .enter().append('text')
            .text((d) => d.distance + "km, " + d.time + "min")
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', (d, i) => i * this._scrollStepSizeLoStrap + this._loStrap.fontSize('normal') * 2.5)
            .style('font', this._loStrap.font('small'))
            .attr("fill", this._loStrap.colorMode === 'bw' ? 'white' : 'gray');

        let touchBoxes = Math.ceil(this._loStrap.height / this._scrollStepSizeLoStrap);
        for (let i = 0; i < touchBoxes; i++) {
            this._overlayLoStrap.append('rect')
            .attr('x', 0)
            .attr('y', i * this._scrollStepSizeLoStrap)
            .attr('height', this._scrollStepSizeLoStrap)
            .attr('width', this._loStrap.width)
            .attr('stroke-opacity', 0)
            .attr('fill-opacity', 0)
            .on('mouseup', () => {
                let index = this._curFocus + i;
                if (index >= this._runs.length)
                    return;

                this.loadRunStats(this._runs[index]);
            });
        }
    }

    loadRunStats(run) {
        this._watch.d3.csv(this._url + run.id + '.csv')
            .then((d) => { this.initRunStats(run, d); });
    }

    initRunStats(runMeta, runData) {
        this.cleanInterface();
        this._curMode = ActivityTracker.modes.runStats;

        let x = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.width * 0.1, this._watch.width * 0.9]);
        
        let y = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.height * 0.1, this._watch.height * 0.9]);

        let minX = Number.parseFloat(this._watch.d3.min(runData, (d) => d.lat));
        let maxX = Number.parseFloat(this._watch.d3.max(runData, (d) => d.lat));
        let minY = Number.parseFloat(this._watch.d3.min(runData, (d) => d.long));
        let maxY = Number.parseFloat(this._watch.d3.max(runData, (d) => d.long));

        let diffX = maxX - minX;
        let diffY = maxY - minY;

        if (diffX > diffY) {
            x.domain([minX, maxX]);
            y.domain([minY - (diffX - diffY) / 2, maxY + (diffX - diffY) / 2]);
        } else {
            x.domain([minX  - (diffY - diffX) / 2, maxX + (diffY - diffX) / 2]);
            y.domain([minY, maxY]);
        }

        console.log(minX, maxX, minY, maxY, diffX, diffY);
        console.log(x.domain(), y.domain());
        console.log(maxX, (diffY - diffX) / 2, maxX + (diffY - diffX) / 2)

        let line = this._watch.d3.line()
            .x((d) => x(d.lat))
            .y((d) => y(d.long))
            .curve(this._watch.d3.curveMonotoneX);

        this._staticConWatch.append('path')
            .datum(runData)
            .attr('d', line)
            .attr('stroke', 'deepskyblue')
            .attr('stroke-width', 5);

        this._staticConWatch.append('circle')
            .attr('cx', x(runData[0].lat))
            .attr('cy', y(runData[0].long))
            .attr('r', 7)
            .attr('fill', "limegreen");

        this._staticConWatch.append('circle')
            .attr('cx', x(runData[runData.length - 1].lat))
            .attr('cy', y(runData[runData.length - 1].long))
            .attr('r', 7)
            .attr('fill', "indianred");

        this._staticConWatch.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._watch.width)
            .attr('height', this._watch.height)
            .attr('fill', 'rgb(50, 50, 50)')
            .style('fill-opacity', 0.6);

        this._staticConWatch.append('text')
            .text(runMeta.name)
            .attr('x', this._watch.width / 2)
            .attr('y', 100)
            .style('font', this._watch.font('large'))
            .attr('text-anchor', 'middle')
            .attr('fill', 'white');

        this._staticConWatch.append('text')
            .text("Time")
            .attr('x', 100)
            .attr('y', 210)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._staticConWatch.append('text')
            .text(runMeta.time)
            .attr('x', 100)
            .attr('y', 250)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._staticConWatch.append('text')
            .text("min")
            .attr('x', 100)
            .attr('y', 280)
            .style('font', this._watch.font('small'))
            .attr('fill', 'white');

        this._staticConWatch.append('text')
            .text("Distance")
            .attr('x', 250)
            .attr('y', 210)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._staticConWatch.append('text')
            .text(runMeta.distance)
            .attr('x', 250)
            .attr('y', 250)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._staticConWatch.append('text')
            .text("km")
            .attr('x', 250)
            .attr('y', 280)
            .style('font', this._watch.font('small'))
            .attr('fill', 'white');
    }

    loadTracking() {
        this._watch.d3.csv(this._url + this._runs[0].id + '.csv')
            .then((d) => {
                this.initTracking(d);
            })
    }

    initTracking(data) {
        this._curMode = ActivityTracker.modes.tracking;
        let index = 0;

        this._staticConLoStrap.append('text')
            .text('pace')
            .style('font', this._loStrap.font('normal'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 20)
            .attr('y', 26)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('dist')
            .style('font', this._loStrap.font('normal'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 20)
            .attr('y', 58)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('time')
            .style('font', this._loStrap.font('normal'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 20)
            .attr('y', 90)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('min/km')
            .style('font', this._loStrap.font('small'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 130)
            .attr('y', 26)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('m')
            .style('font', this._loStrap.font('small'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 130)
            .attr('y', 58)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('min')
            .style('font', this._loStrap.font('small'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 130)
            .attr('y', 90)
            .attr('fill', 'white');

        let pace = this._staticConLoStrap.append('text')
            .text("00:00")
            .style('font', this._loStrap.font('large'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 70)
            .attr('y', 26)
            .attr('fill', 'white');

        let dist = this._staticConLoStrap.append('text')
            .text("00.00")
            .style('font', this._loStrap.font('large'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 70)
            .attr('y', 58)
            .attr('fill', 'white');

        let time = this._staticConLoStrap.append('text')
            .text("00:00")
            .style('font', this._loStrap.font('large'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', 70)
            .attr('y', 90)
            .attr('fill', 'white');

        let updateValues = () => {
            if (index >= data.length - 1) {
                index = 0;
            }

            index++;
            pace.text(this.formatPace(data[index].speed));
            dist.text(this.formatDistance(data[index].distance));
            time.text(this.formatSeconds(index));

            this._curTimer = setTimeout(() => updateValues(), 1500);
        }

        this._curTimer = setTimeout(() => updateValues(), 1500);
    }

    formatPace(val) {
        val = "" + (val * 1.60934);
        let splits = val.split('.');
        let min = splits[0] < 10 ? "0" + splits[0] : splits[0];
        let sec = Math.floor((60 * parseFloat("0." + splits[1])));
        sec = sec < 10 ? "0" + sec : sec;
        return min + ":" + sec;
    }

    formatDistance(val) {
        let dist = (val / 1000).toFixed(2);
        return dist < 10 ? "0" + dist : dist;
    }

    formatSeconds(val) {
        let min = Math.floor(val / 60);
        let sec = val - 60 * min;
        min = min < 10 ? "0" + min : min;
        sec = sec < 10 ? "0" + sec : sec;
        return min + ":" + sec;
    }

    onBezelRotate(e) {
        let oldFocus = this._curFocus;
        if (e.direction === "CW" && this._curFocus < this._runs.length) {
            this._curFocus += 1;
        } else if (e.direction === "CCW" && this._curFocus >= 1) {
            this._curFocus -= 1;
        }

        let loStrapInter = this._loStrap.d3.interpolateNumber(
            ((oldFocus) * -this._scrollStepSizeLoStrap),
            ((this._curFocus) * -this._scrollStepSizeLoStrap));

        let t = this._watch.d3.timer((elapsed) => {
            if (elapsed > 500) {
                t.stop();
                if (this._loStrap.type !== 'eink')
                    this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
                return;
            }
            if (this._loStrap.type !== 'eink')
                this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(elapsed / 500) + ')');
            
        });

        if (this._loStrap.type === 'eink')
            this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
    }

    onHwkey(e) {
        if (e.key === "back") {
            if (this._curTimer) {
                clearTimeout(this._curTimer);
                this._curTimer = undefined;
            }
            
            if (this._curMode === ActivityTracker.modes.overview) {
                let intent = new CustomEvent('intent', {detail: {type: 'close'}});
                document.dispatchEvent(intent);
            } else if (this._curMode === ActivityTracker.modes.runDetails) {
                // load runStats
            } else {
                this.initOverview();
            }
        }
    }
}