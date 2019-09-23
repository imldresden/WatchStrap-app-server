import App from "./app.mjs";

export default class FriendlyReminder extends App{
    static name = "Friendly Reminder";
    static description = "Set up reminders and todos.";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        setTimeout(() => this.initApp(), 5000);
    }

    initApp() {
        this._loStrap.converting.pendingFullRefresh = true;
        this._loStrap.svg.append('text')
            .text("Meeting with Charles")
            .attr('x', 20)
            .attr('y', -40)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('transform', 'rotate(75) translate(0, 0)')
            .style('font', this._loStrap.font('normal', 'bold'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("in 15 minutes at Main Library")
            .attr('x', 22)
            .attr('y', -20)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('transform', 'rotate(75) translate(0, 0)')
            .style('font', this._loStrap.font('normal'))
            .attr('fill', 'white');

        this._loStrap.svg.append('text')
            .text("Time: 16:30 GMT; Cloudy at 23°C")
            .attr('x', 22)
            .attr('y', 0)
            .attr('width', this._loStrap.width)
            .attr('height', this._loStrap.height)
            .attr('transform', 'rotate(75) translate(0, 0)')
            .style('font', this._loStrap.font('small'))
            .attr('fill', 'white');
    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}