import App from "./app.mjs";

export default class PublicTransport extends App{
    static name = "Public Transport";
    static description = "Getting from A to B.";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this.initApp();
    }

    initApp() {
        
        this._watch.svg.append('text')
            .text("Change to")
            .attr('x', this._watch.width / 2)
            .attr('y', 60)
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._watch.svg.append('image')
            .attr("href", '/assets/public-transport/favicon.png')
            .attr('x', this._watch.width * .375)
            .attr('y', 90)
            .attr('height', 30)
            .attr('width', 30);

        this._watch.svg.append('text')
            .text("19")
            .attr('x', this._watch.width * .55)
            .attr('y', 120)
            .attr('text-anchor', 'middle')
            .style('font', "40px Bahnschrift Light")
            .attr('fill', 'deepskyblue');
        
        this._watch.svg.append('text')
            .text("coming in")
            .attr('x', this._watch.width / 2)
            .attr('y', 160)
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('small'))
            .attr('fill', 'white');

        this._watch.svg.append('text')
            .text("7")
            .attr('x', this._watch.width  / 2)
            .attr('y', 260)
            .attr('text-anchor', 'middle')
            .style('font', '90px Bahnschrift Light')
            .attr('fill', 'deepskyblue');

        this._watch.svg.append('text')
            .text("and in 12, 21 min")
            .attr('x', this._watch.width / 2)
            .attr('y', 300)
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('small'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Airport Upper Level")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', this._loStrap.height * 0.05)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('image')
            .attr("href", '/assets/public-transport/favicon.png')
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 65)
            .attr('height', 25)
            .attr('width', 25);

        this._loStrap.svg.append('text')
            .text("19")
            .attr('x', this._loStrap.width * .28)
            .attr('y', 89)
            .attr('text-anchor', 'left')
            .style('font', "32px Bahnschrift Light")
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("26 Stops to:")
            .attr('x', this._loStrap.width * .95)
            .attr('y', 85)
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('small'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Waikiki Beach & Hotels")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 120)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('small'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("S King St +")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 170)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Punchbowl St")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 200)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('image')
            .attr("href", '/assets/public-transport/favicon.png')
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 220)
            .attr('height', 25)
            .attr('width', 25);

        this._loStrap.svg.append('text')
            .text("3")
            .attr('x', this._loStrap.width * .28)
            .attr('y', 244)
            .attr('text-anchor', 'left')
            .style('font', "32px Bahnschrift Light")
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("10 Stops to:")
            .attr('x', this._loStrap.width * .95)
            .attr('y', 240)
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('small'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Kapiolani Comm College")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 275)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('small'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Kapiolani Bl +")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 325)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Kalakaua Ave")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 355)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Walk")
            .attr('x', this._loStrap.width * .15)
            .attr('y', 395)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("about 2 min to:")
            .attr('x', this._loStrap.width * .95)
            .attr('y', 395)
            .attr('text-anchor', 'right')
            .style('font', this._loStrap.font('small'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Hawai'i Convention")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 445)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');
        this._loStrap.svg.append('text')
            .text("Center")
            .attr('x', this._loStrap.width * 0.15)
            .attr('y', 475)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('line')
            .attr('x1', this._loStrap.width * 0.06)
            .attr('x2', this._loStrap.width * 0.06)
            .attr('y1', 38)
            .attr('y2', 437)
            .attr('stroke', 'lightgray')
            .attr('stroke-width', 1.5);

        this._loStrap.svg.append('circle')
            .attr('cx', this._loStrap.width * 0.06)
            .attr('cy', 38)
            .attr('r', this._loStrap.width * 0.025)
            .attr('fill', 'deepskyblue');

        this._loStrap.svg.append('circle')
            .attr('cx', this._loStrap.width * 0.06)
            .attr('cy', 162)
            .attr('r', this._loStrap.width * 0.025)
            .attr('fill', 'white');

        this._loStrap.svg.append('circle')
            .attr('cx', this._loStrap.width * 0.06)
            .attr('cy', 317)
            .attr('r', this._loStrap.width * 0.025)
            .attr('fill', 'white');

        this._loStrap.svg.append('circle')
            .attr('cx', this._loStrap.width * 0.06)
            .attr('cy', 437)
            .attr('r', this._loStrap.width * 0.025)
            .attr('fill', 'limegreen');

        this._upStrap.svg.append('image')
            .attr("href", '/assets/public-transport/qr-code.png')
            .attr('x', this._upStrap.width * 0.15)
            .attr('y', this._upStrap.width * 0.15 + 100)
            .attr('height', this._upStrap.width * 0.7)
            .attr('width', this._upStrap.width * 0.7);
        this._upStrap.svg.append('rect')
            .attr('x', this._upStrap.width * 0.1)
            .attr('y', this._upStrap.width * 0.1 + 100)
            .attr('height', this._upStrap.width * 0.8)
            .attr('width', this._upStrap.width * 0.8)
            .attr('fill', 'white');

        this._upStrap.svg.append('text')
            .attr('x', this._upStrap.width / 2)
            .attr('y', 80)
            .attr('text-anchor', 'middle')
            .text('Single Trip')
            .style("font", this._upStrap.font('large'))
            .attr('fill', 'white');

        this._upStrap.svg.append('text')
            .attr('x', this._upStrap.width / 2)
            .attr('y', 370)
            .attr('text-anchor', 'middle')
            .text('Valid until:')
            .style("font", this._upStrap.font('normal'))
            .attr('fill', 'white');
        this._upStrap.svg.append('text')
            .attr('x', this._upStrap.width / 2)
            .attr('y', 410)
            .attr('text-anchor', 'middle')
            .text('Apr 23, 13:37')
            .style("font", this._upStrap.font('normal', 'bold'))
            .attr('fill', 'deepskyblue');
        this._upStrap.svg.append('text')
            .attr('x', this._upStrap.width / 2)
            .attr('y', 450)
            .attr('text-anchor', 'middle')
            .text('One Person')
            .style("font", this._upStrap.font('normal'))
            .attr('fill', 'white');
        this._upStrap.svg.append('text')
            .attr('x', this._upStrap.width / 2)
            .attr('y', 490)
            .attr('text-anchor', 'middle')
            .text('Incl. Transfers')
            .style("font", this._upStrap.font('normal'))
            .attr('fill', 'white');
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}