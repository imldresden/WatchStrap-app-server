export default class TestApp {
    constructor(d3SvgElem) {
        this.d3SvgElem = d3SvgElem;
        this.createVis();
    }

    createVis () {

        /*let svgElem = document.getElementById(this.svgId);
        console.log(svgElem);
        new SSVG({
            //onDrawn: () => { this.onSurfaceUpdate('watch', watchId); }
            svgElement: svgElem
        });*/
        //new SSVG();

        let svg = this.d3SvgElem;

        let width = +svg.attr("width"),
            height = +svg.attr("height");
        console.log(width, height);

        function getCircle(cx, cy, r) {
            return {
                getPointFromAngle: function (angle) {
                    return {
                        x: cx + Math.sin(angle) * r,
                        y: cy - Math.cos(angle) * r
                    }
                }
            };
        }

        function getRandomString(numberOfCharacters) {
            var alphabet = '0123456789abcdef';
            var returnString = '';

            for (var i = 0; i < numberOfCharacters; i++) {
                returnString += alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            return returnString;
        }

        function updatePositions() {
            updates++;
            data.forEach(function (data, i) {
                var angle = data.angle;
                const circle = data.circle;
                if (updates > i) {
                    angle += data.angularSpeed;
                }
                data.angle = angle;
                data.position = circle.getPointFromAngle(angle);
            })
        }

        function updateVis() {
            var circles = svg.selectAll('rect')
                .data(data, function (d) {
                    return d.id
                });

            circles.enter()
                .append('rect')
                .attr('width', 5)
                .attr('height', 5)
                .attr('fill', function (d) {
                    return d.color
                });

            circles
                .attr('x', function (d) {
                    return d.position.x
                })
                .attr('y', function (d) {
                    return d.position.y
                });
        }

        /*if (false) {

            var color = d3.scaleOrdinal(d3.schemeAccent);


            var data = [];
            for (var i = 0; i < 100; i++) {
                const circle = getCircle(150, 150, 50 + Math.random() * 100);
                data.push({
                    color: '#' + getRandomString(6), //color(Math.floor(Math.random() * 20)),
                    circle: circle,
                    angle: 0,
                    angularSpeed: 0.001 + Math.random() * 0.01,
                    position: circle.getPointFromAngle(0),
                    id: i
                });
            }

            var updates = 0;



            const raf = function () {
                updatePositions();
                updateVis();

                requestAnimationFrame(raf);
            };
            raf();
        } else {*/


            var randomX = d3.randomNormal(width / 2, 80),
                randomY = d3.randomNormal(height / 2, 80),
                data = d3.range(50).map(function () {
                    return [randomX(), randomY()];
                });

            var g = svg.append("g");

            var circle = g.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("r", 25)
                .attr("fill", "blue")
                .attr("transform", function (d) {
                    return "translate(" + d + ")";
                });

            svg.append("rect")
                .attr("fill", "none")
                .attr("pointer-events", "all")
                .attr("width", width)
                .attr("height", height)
                .call(d3.zoom()
                    .scaleExtent([1, 8])
                    .on("zoom", zoom));
        //}

        function zoom() {
            g.attr("transform", d3.event.transform);
        }

    }

    onUpdate() {
        //return;
        let now = Date.now();
        if (now - this.lastUpdate <= 200 && !this.timeout) {
            this.timeout = setTimeout(() => {
                this.timeout = undefined;
                this.onUpdate();
            }, this.lastUpdate + 205);
            return;
        } else if (this.timeout)
            return;
        let canvases = this.container.getElementsByTagName('canvas');
        if (canvases.length === 0)
            return;
        let canvas = canvases[0];
        //let ctx = canvas.getContext('2d');
        //let imageData = ctx.getImageData(0,0,360,360);
        let imageData = canvas.toDataURL("image/jpeg", 0.6);
        let msg = {
            target: 'watch',
            type: 'imageData',
            payload: imageData
        };
        this.socket.emit('msg', msg);
        this.lastUpdate = Date.now();
        //console.log("update");
    }
}