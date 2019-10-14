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
            .attr('height', this._upStrap.colorMode === 'bw' ? -this._upStrap.fontSize('normal') * 3 : -this._upStrap.fontSize('normal') * 4.5)
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('fill', this._upStrap.colorMode === 'bw' ? 'rgb(255,255,255)' : 'none')
            .attr('stroke', this._upStrap.colorMode === 'bw' ? 'none' : 'deepskyblue');

        this._staticConUpStrap.append('text')
            .text("Start")
            .attr('text-anchor', 'middle')
            .attr('x', this._upStrap.width / 2)
            .style('font', this._upStrap.font('normal', 'bold'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', -this._upStrap.height * .075 - this._upStrap.fontSize('normal') * 1.2)
            .attr("fill", this._upStrap.colorMode === 'bw' ? 'black' : 'white');

        this._staticConUpStrap.append('text')
            .text("New Activity")
            .attr('text-anchor', 'middle')
            .attr('x', this._upStrap.width / 2)
            .style('font', this._upStrap.font('small', 'bold'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', -this._upStrap.height * .075)
            .attr("fill", this._upStrap.colorMode === 'bw' ? 'black' : 'white');

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
        this._curRun = runMeta;
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

        let xStats = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.width * 0.05, this._loStrap.width * 0.95]);
        xStats.domain([this._loStrap.d3.min(runData, (d) => (new Date(d.time)).getTime()), this._loStrap.d3.max(runData, (d) => (new Date(d.time)).getTime())]);
        
        let yPace = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.fontSize('normal') * 3, this._loStrap.fontSize('normal') * 2]);
        yPace.domain([this._loStrap.d3.min(runData, (d) => d.speed), this._loStrap.d3.max(runData, (d) => d.speed)]);

        let linePace = this._loStrap.d3.line()
            .x((d) => xStats((new Date(d.time)).getTime()))
            .y((d) => yPace(d.speed))
            .curve(this._loStrap.d3.curveLinear);

        this._staticConLoStrap.append('path')
            .datum(runData)
            .attr('d', linePace)
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'white' : 'deepskyblue')
            .attr('stroke-width', this._loStrap.colorMode === 'bw' ? 1 : 2);

        this._staticConLoStrap.append('text')
            .text(runMeta.avgPace)
            .attr('x', this._loStrap.width * 0.95)
            .attr('y', this._loStrap.fontSize('normal') * 1.5)
            .style('font', this._loStrap.font('normal'))
            .attr('text-anchor', 'right')
            .attr('fill', this._loStrap.colorMode === 'bw' ? 'white' : 'deepskyblue');
        this._staticConLoStrap.append('text')
            .text("Pace")
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', this._loStrap.fontSize('normal') * 1.5)
            .style('font', this._loStrap.font('small'))
            .attr('text-anchor', 'left')
            .attr('fill', 'white');

        let yHR = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.fontSize('normal') * 6.5, this._loStrap.fontSize('normal') * 5.5]);
        yHR.domain([this._loStrap.d3.min(runData, (d) => Number.parseInt(d.hr)), this._loStrap.d3.max(runData, (d) => Number.parseInt(d.hr))]);

        let lineHR = this._loStrap.d3.line()
            .x((d) => xStats((new Date(d.time)).getTime()))
            .y((d) => yHR(d.hr))
            .curve(this._loStrap.d3.curveLinear);

        this._staticConLoStrap.append('path')
            .datum(runData)
            .attr('d', lineHR)
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'white' : 'indianred')
            .attr('stroke-width', this._loStrap.colorMode === 'bw' ? 1 : 2);

        this._staticConLoStrap.append('text')
            .text(runMeta.avgHR)
            .attr('x', this._loStrap.width * 0.95)
            .attr('y', this._loStrap.fontSize('normal') * 5)
            .style('font', this._loStrap.font('normal'))
            .attr('text-anchor', 'right')
            .attr('fill', this._loStrap.colorMode === 'bw' ? 'white' : 'indianred');
        this._staticConLoStrap.append('text')
            .text("Heart Rate")
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', this._loStrap.fontSize('normal') * 5)
            .style('font', this._loStrap.font('small'))            
            .attr('text-anchor', 'left')
            .attr('fill', 'white');

        let yElev = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.fontSize('normal') * 10, this._loStrap.fontSize('normal') * 9]);
        yElev.domain([this._loStrap.d3.min(runData, (d) => Number.parseFloat(d.alt)) - 30, this._loStrap.d3.max(runData, (d) => Number.parseFloat(d.alt)) + 30]);

        let lineElev = this._loStrap.d3.line()
            .x((d) => xStats((new Date(d.time)).getTime()))
            .y((d) => yElev(d.alt))
            .curve(this._loStrap.d3.curveLinear);

        this._staticConLoStrap.append('path')
            .datum(runData)
            .attr('d', lineElev)
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'white' : 'limegreen')
            .attr('stroke-width', this._loStrap.colorMode === 'bw' ? 1 : 2);

        this._staticConLoStrap.append('text')
            .text(runMeta.elevGain)
            .attr('x', this._loStrap.width * 0.95)
            .attr('y', this._loStrap.fontSize('normal') * 8.5)
            .style('font', this._loStrap.font('normal'))
            .attr('text-anchor', 'right')
            .attr('fill', this._loStrap.colorMode === 'bw' ? 'white' : 'limegreen');
        this._staticConLoStrap.append('text')
            .text("Elev. Gain")
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', this._loStrap.fontSize('normal') * 8.5)
            .style('font', this._loStrap.font('small'))
            .attr('text-anchor', 'left')
            .attr('fill', 'white');

        this._staticConLoStrap.append('rect')
            .attr('x', this._loStrap.width * 0.05)
            .attr('y', this._loStrap.colorMode === 'bw' ? this._loStrap.fontSize('normal') * 10.7 : this._loStrap.fontSize('normal') * 12)
            .attr('width', this._loStrap.width * 0.9)
            .attr('height', this._loStrap.fontSize('normal') * 2.25)
            .attr('fill', this._loStrap.colorMode === 'bw' ? 'white' : 'none')
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'none' : 'deepskyblue');
            
        this._staticConLoStrap.append('text')
            .text("Show Details")
            .attr('text-anchor', 'middle')
            .attr('x', this._loStrap.width / 2)
            .style('font', this._loStrap.font('small', 'bold'))
            .attr('y', this._loStrap.colorMode === 'bw' ? this._loStrap.fontSize('normal') * 12 : this._loStrap.fontSize('normal') * 13.3)
            .attr("fill", this._loStrap.colorMode === 'bw' ? 'black' : 'white');

        this._staticConLoStrap.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('fill-opacity', 0)
            .on('mousedown', () => {
                this.initRunDetails(runMeta, runData);
            });
    }

    loadRunDetails(run) {
        this._watch.d3.csv(this._url + run.id + '.csv')
            .then((d) => { this.initRunDetails(run, d); });
    }

    initRunDetails(runMeta, runData) {
        this._curMode = ActivityTracker.modes.runDetails;
        this.cleanInterface();

        let y = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.height * 0.05, this._loStrap.height * 0.95]);
        y.domain([this._loStrap.d3.min(runData, (d) => (new Date(d.time)).getTime()), this._loStrap.d3.max(runData, (d) => (new Date(d.time)).getTime())]);
        
        let xPace = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.width * 0.05, this._loStrap.width * 0.95]);
        xPace.domain([this._loStrap.d3.min(runData, (d) => d.speed), this._loStrap.d3.max(runData, (d) => d.speed)]);

        let linePace = this._loStrap.d3.line()
            .x((d) => xPace(d.speed))
            .y((d) => y((new Date(d.time)).getTime()))
            .curve(this._loStrap.d3.curveLinear);

        this._staticConLoStrap.append('path')
            .datum(runData)
            .attr('d', linePace)
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'white' : 'deepskyblue')
            .attr('stroke-width', 2);

        let xHR = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.width * 0.05, this._loStrap.width * 0.95]);
        xHR.domain([this._loStrap.d3.min(runData, (d) => Number.parseInt(d.hr)), this._loStrap.d3.max(runData, (d) => Number.parseInt(d.hr))]);

        let lineHR = this._loStrap.d3.line()
            .x((d) => xHR(d.hr))
            .y((d) => y((new Date(d.time)).getTime()))
            .curve(this._loStrap.d3.curveLinear);

        this._staticConLoStrap.append('path')
            .datum(runData)
            .attr('d', lineHR)
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'none' : 'indianred')
            .attr('stroke-width', 1);

        let xElev = this._loStrap.d3.scaleLinear()
            .rangeRound([this._loStrap.width * 0.05, this._loStrap.width * 0.95]);
            xElev.domain([this._loStrap.d3.min(runData, (d) => Number.parseFloat(d.alt)) - 30, this._loStrap.d3.max(runData, (d) => Number.parseFloat(d.alt)) + 30]);

        let lineElev = this._loStrap.d3.line()
            .x((d) => xElev(d.alt))
            .y((d) => y((new Date(d.time)).getTime()))
            .curve(this._loStrap.d3.curveLinear);

        this._staticConLoStrap.append('path')
            .datum(runData)
            .attr('d', lineElev)
            .attr('stroke', this._loStrap.colorMode === 'bw' ? 'none' : 'limegreen')
            .attr('stroke-width', 1);

        let strapLine = this._staticConLoStrap.append('line')
            .attr('x1', 0)
            .attr('y1', y((new Date(runData[150].time)).getTime()))
            .attr('x2', this._loStrap.width)
            .attr('y2', y((new Date(runData[150].time)).getTime()))
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        let totalLength = (this._watch.d3.max(runData, (d) => (new Date(d.time)).getTime()) - this._watch.d3.min(runData, (d) => (new Date(d.time)).getTime())) / 1000;
        let x = this._watch.d3.scaleLinear()
            .rangeRound([0, totalLength]);
        x.domain([this._watch.d3.min(runData, (d) => (new Date(d.time)).getTime()), this._watch.d3.max(runData, (d) => (new Date(d.time)).getTime())]);
        
        let yPace = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.height * 0.66, this._watch.height * 0.33]);
        yPace.domain([this._watch.d3.min(runData, (d) => d.speed), this._watch.d3.max(runData, (d) => d.speed)]);

        let linePaceWatch = this._watch.d3.line()
            .x((d) => x((new Date(d.time)).getTime()))
            .y((d) => yPace(d.speed))
            .curve(this._watch.d3.curveMonotoneX);

        this._scrollConWatch.append('path')
            .datum(runData)
            .attr('d', linePaceWatch)
            .attr('stroke', 'deepskyblue')
            .attr('stroke-width', 6);

        let yHR = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.height * 0.66, this._watch.height * 0.33]);
        yHR.domain([this._watch.d3.min(runData, (d) => Number.parseInt(d.hr)), this._watch.d3.max(runData, (d) => Number.parseInt(d.hr))]);

        let lineHRWatch = this._watch.d3.line()
            .x((d) => x((new Date(d.time)).getTime()))
            .y((d) => yHR(d.hr))
            .curve(this._watch.d3.curveMonotoneX);

        this._scrollConWatch.append('path')
            .datum(runData)
            .attr('d', lineHRWatch)
            .attr('stroke', 'indianred')
            .attr('stroke-width', 3);

        let yElev = this._watch.d3.scaleLinear()
            .rangeRound([this._watch.height * 0.66, this._watch.height * 0.33]);
        yElev.domain([this._watch.d3.min(runData, (d) => Number.parseFloat(d.alt)) - 15, this._watch.d3.max(runData, (d) => Number.parseFloat(d.alt)) + 15]);

        let lineElevWatch = this._watch.d3.line()
            .x((d) => x((new Date(d.time)).getTime()))
            .y((d) => yElev(d.alt))
            .curve(this._watch.d3.curveMonotoneX);

        this._scrollConWatch.append('path')
            .datum(runData)
            .attr('d', lineElevWatch)
            .attr('stroke', 'limegreen')
            .attr('stroke-width', 3);

        this._staticConWatch.append('text')
            .text('Time')
            .attr('text-anchor', 'right')
            .attr('x', this._watch.width * .34)
            .attr('y', 50)
            .style('font', this._watch.font('small'))
            .attr('fill', 'gray');

        let time = this._staticConWatch.append('text')
            .text(this.formatSeconds(0))
            .attr('text-anchor', 'right')
            .attr('x', this._watch.width *.34)
            .attr('y', 80)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'gray');

        this._staticConWatch.append('text')
            .text('Dist')
            .attr('text-anchor', 'left')
            .attr('x', this._watch.width * .65)
            .attr('y', 50)
            .style('font', this._watch.font('small'))
            .attr('fill', 'gray');

        let dist = this._staticConWatch.append('text')
            .text(this.formatDistance(runData[0].distance))
            .attr('text-anchor', 'left')
            .attr('x', this._watch.width *.65)
            .attr('y', 80)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'gray');

        this._staticConWatch.append('text')
            .text('Pace')
            .attr('text-anchor', 'middle')
            .attr('x', this._watch.width / 2)
            .attr('y', 40)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        let pace = this._staticConWatch.append('text')
            .text(this.formatPace(runData[0].speed))
            .attr('text-anchor', 'middle')
            .attr('x', this._watch.width / 2)
            .attr('y', 80)
            .style('font', this._watch.font('large'))
            .attr('fill', 'deepskyblue');

        this._staticConWatch.append('text')
            .text('Heart Rate')
            .attr('text-anchor', 'right')
            .attr('x', this._watch.width * .45)
            .attr('y', this._watch.height - 80)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        let hr = this._staticConWatch.append('text')
            .text(runData[0].hr)
            .attr('text-anchor', 'right')
            .attr('x', this._watch.width * .45)
            .attr('y', this._watch.height - 40)
            .style('font', this._watch.font('large'))
            .attr('fill', 'indianred');

        this._staticConWatch.append('text')
            .text('Elevation')
            .attr('text-anchor', 'left')
            .attr('x', this._watch.width * .55)
            .attr('y', this._watch.height - 80)
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        let elev = this._staticConWatch.append('text')
            .attr('text-anchor', 'left')
            .attr('x', this._watch.width * .55)
            .attr('y', this._watch.height - 40)
            .style('font', this._watch.font('large'))
            .attr('fill', 'limegreen');


        this._detailScroll = (index) => {
            if (index < 0 || index >= runData.length)
                return;
            this._curFocus = index;

            this._scrollConWatch
                .attr('transform', 'translate(' + ((this._watch.width / 2) - x((new Date(runData[index].time)).getTime())) + ', 0)');   
            strapLine
                .attr('y1', y((new Date(runData[index].time)).getTime()))
                .attr('y2', y((new Date(runData[index].time)).getTime()));

            pace.text(this.formatPace(runData[index].speed));
            hr.text(runData[index].hr);
            elev.text(Number.parseFloat(runData[index].alt).toFixed(2));
            dist.text(this.formatDistance(runData[index].distance))
            let t = (new Date(runData[index].time)).getTime() - (new Date(runData[0].time)).getTime();
            time.text(this.formatSeconds(t / 1000));

        }

        this._detailScroll(0);

        this._staticConWatch.append('line')
            .attr('x1', this._watch.width / 2)
            .attr('y1', this._watch.height * 0.3)
            .attr('x2', this._watch.width / 2)
            .attr('y2', this._watch.height * 0.7)
            .attr('stroke', 'white')
            .attr('stroke-width', 1);

        this._staticConLoStrap.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('fill-opacity', 0)
            .on('mouseup', () => mapTouchOnStrap());

        let mapTouchOnStrap = () => {
            let eY = this._loStrap.d3.event.y;
            if (eY < y.domain[0] || eY > y.domain[1]) return;

            let index = runData.indexOf(runData.find((d) => (new Date(d.time)).getTime() >= y.invert(eY)));
            this._detailScroll(index);
        }
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
            .attr('x', this._loStrap.height * 0.05)
            .attr('y', this._loStrap.width * 0.2)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('dist')
            .style('font', this._loStrap.font('normal'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05)
            .attr('y', this._loStrap.width * 0.55)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('time')
            .style('font', this._loStrap.font('normal'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05)
            .attr('y', this._loStrap.width * 0.9)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('min/km')
            .style('font', this._loStrap.font('small'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05 + this._loStrap.fontSize('small') * 10)
            .attr('y', this._loStrap.width * 0.2)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('m')
            .style('font', this._loStrap.font('small'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05 + this._loStrap.fontSize('small') * 10)
            .attr('y', this._loStrap.width * 0.55)
            .attr('fill', 'white');

        this._staticConLoStrap.append('text')
            .text('min')
            .style('font', this._loStrap.font('small'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05 + this._loStrap.fontSize('small') * 10)
            .attr('y', this._loStrap.width * 0.9)
            .attr('fill', 'white');

        let pace = this._staticConLoStrap.append('text')
            .text("00:00")
            .style('font', this._loStrap.font('large'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05 + this._loStrap.fontSize('small') * 4)
            .attr('y', this._loStrap.width * 0.2)
            .attr('fill', 'white');

        let dist = this._staticConLoStrap.append('text')
            .text("00.00")
            .style('font', this._loStrap.font('large'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05 + this._loStrap.fontSize('small') * 4)
            .attr('y', this._loStrap.width * 0.55)
            .attr('fill', 'white');

        let time = this._staticConLoStrap.append('text')
            .text("00:00")
            .style('font', this._loStrap.font('large'))
            .attr('transform', 'rotate(90) translate(' + this._loStrap.width + ', 0)')
            .attr('x', this._loStrap.height * 0.05 + this._loStrap.fontSize('small') * 4)
            .attr('y', this._loStrap.width * 0.9)
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

        if (this._curMode === ActivityTracker.modes.runDetails) {
            if (e.direction === "CW") {
                this._detailScroll(this._curFocus + 2);
            } else if (e.direction === "CCW") {
                this._detailScroll(this._curFocus - 2);
            }
        } else if (this._curMode === ActivityTracker.modes.overview) {
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
                this.loadRunStats(this._curRun);
            } else {
                this.initOverview();
            }
        }
    }
}