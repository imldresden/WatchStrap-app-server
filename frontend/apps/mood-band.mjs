import App from "./app.mjs";

export default class MoodBand extends App{
    static name = "Mood Band";
    static description = "Relaxing Nature for you";

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this.initApp();
    }

    initApp() {
        let vid = this._loStrap.document.createElement('video');
        vid.src = '/assets/mood-band/video.mp4';
        vid.autoplay = true;
        vid.loop = true;
        vid.style = "position: absolute; top: 450px; left: -100px; transform: rotate(90deg); transform-origin: top; width: 900px; overflow: hidden;";
        this._loStrap.document.body.appendChild(vid);

        let vid2 = this._upStrap.document.createElement('video');
        vid2.src = '/assets/mood-band/video-2.mp4';
        vid2.autoplay = true;
        vid2.loop = true;
        vid2.style = "position: absolute; top: -40px; left: -20px; transform: rotate(-90deg); transform-origin: bottom; width: 620; overflow: hidden;";
        this._upStrap.document.body.appendChild(vid2);

        this._watch.svg.append('text')
            .text(() => {
                let min = (new Date()).getMinutes();
                return min < 10 ? "0" + min : min;
            })
            .attr('x', this._watch.width * 0.52)
            .attr('y', 200)
            .style('font', '70px Bahnschrift Light')
            .attr('fill', 'deepskyblue');

        this._watch.svg.append('text')
            .text(() => {
                let min = (new Date()).getHours();
                return min < 10 ? "0" + min : min;
            })
            .attr('x', this._watch.width * 0.48)
            .attr('y', 200)
            .attr('text-anchor', 'right')
            .style('font', '70px Bahnschrift Light')
            .attr('fill', 'white');

    }

    onHwkey(e) {
        if (e.key === "back") {
            let intent = new CustomEvent('intent', {detail: {type: 'close'}});
            document.dispatchEvent(intent);
        }
    }
}