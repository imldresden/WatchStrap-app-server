import App from "./app.mjs";

export default class MusicPlayer extends App{
    static name = "Music Player";
    static description = "Play some good tunes";

    static modes = {
        "allPlaylists": 0,
        "playlistView": 1,
        "playQueue": 2
    };
    static states = {
        "playing": 0,
        "paused": 1,
        "stopped": 2
    };

    _playlists;
    _curFocus;
    _curMode;
    _curState;
    _curPlaying;
    _lastPlaylistIndex = 0;
    _lastPlaylist;
    _scrollStepSizeLoStrap = 0;
    _pausedDuration;
    _curTimer;
    _timePassed;

    constructor(watch, loStrap, upStrap) {
        super(watch, loStrap, upStrap);

        this._playlists = [
            {
                id: "playlist1",
                name: "It's a Great Day",
                songs: 102,
                url: "/assets/music-player/data/playlist1.csv"
            },
            {
                id: "playlist2",
                name: "Chillout Hits",
                songs: 100,
                url: "/assets/music-player/data/playlist2.csv"
            },
            {
                id: "playlist3",
                name: "Programming",
                songs: 433,
                url: "/assets/music-player/data/playlist3.csv"
            },
            {
                id: "playlist4",
                name: "The 00s",
                songs: 100,
                url: "/assets/music-player/data/playlist4.csv"
            },
            {
                id: "playlist5",
                name: "Lo-Fi Beats",
                songs: 101,
                url: "/assets/music-player/data/playlist5.csv"
            },
        ];
        this._curFocus = 0;

        this._backgroundWatch = this._watch.svg.append('g').attr('id', 'backgroundWatch');
        this._scrollConWatch = this._watch.svg.append('g').attr('id', 'scrollConWatch');
        this._scrollConLoStrap = this._loStrap.svg.append('g').attr('id', 'scrollConLoStrap');
        this._overlayWatch = this._watch.svg.append('g').attr('id', 'overlayWatch');

        this._curState = MusicPlayer.states.stopped;
        this.initApp();
    }

    initApp() {
        this.loadPlaylistOverview();
        this.loadControls();
        this._watch.svg.on('mousedown', () => {this.onWatchTouch()});
    }

    cleanInterface() {
        this._curFocus = 0;

        this._backgroundWatch.remove();
        this._scrollConWatch.remove();
        this._scrollConLoStrap.remove();
        this._overlayWatch.remove();
        
        this._backgroundWatch = this._watch.svg.append('g').attr('id', 'backgroundWatch');
        this._scrollConWatch = this._watch.svg.append('g').attr('id', 'scrollConWatch');
        this._scrollConLoStrap = this._loStrap.svg.append('g').attr('id', 'scrollConLoStrap');
        this._overlayWatch = this._watch.svg.append('g').attr('id', 'overlayWatch');
    }

    loadPlaylist(index) {
        this._lastPlaylistIndex = index;
        this._watch.d3.csv(this._playlists[index].url)
            .then((d) => {
                this.initPlaylistView(d, index);
            });
    }

    initPlaylistView(data, playlistIndex) {
        this.cleanInterface();
        this._curMode = MusicPlayer.modes.playlistView;
        this._lastPlaylist = data;

        this._scrollConWatch.append('text')
            .text(this._playlists[playlistIndex].name)
            .attr('text-anchor', 'middle')
            .style('font', '30px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', 170)
            .attr("fill", 'white');  

        this._scrollConWatch.append('text')
            .text(this._playlists[playlistIndex].songs + " songs")
            .attr('text-anchor', 'middle')
            .style('font', '18px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', 220)
            .attr("fill", 'white');

        this._scrollConWatch.append('text')
            .text("Created: " + MusicPlayer.formatDate(data[0].addedAt))
            .attr('text-anchor', 'middle')
            .style('font', '18px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', 260)
            .attr("fill", 'white');
        
        this._scrollConWatch.append('g').selectAll('image')
            .data(data)
            .enter().append('image')
            .attr("href", () => MusicPlayer.randomCoverUrl())
            .attr('x', 0)
            .attr('y', (d, i) => this._watch.height * (i + 1))
            .attr('height', 380)
            .attr('width', 380);

        this._scrollConWatch.append('g').selectAll('rect')
            .data(data)
            .enter().append('rect')
            .attr("x", 0)
            .attr('y', (d, i) => 150 + this._watch.height * (i + 1))
            .attr("width", 360)
            .attr("height", 180)
            .attr("fill", "rgba(0,0,0,0.6)");

        this._scrollConWatch.append('g').attr('id','watch-tracknames').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.trackName)
            .attr('text-anchor', 'left')
            .style('font', '24px sans-serif')
            .attr('x', 15)
            .attr('y', (d, i) => 210 + this._watch.height * (i + 1))
            .attr("fill", 'white');

        this._scrollConWatch.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.artistName)
            .attr('text-anchor', 'left')
            .style('font', '18px sans-serif')
            .attr('x', 30)
            .attr('y', (d, i) => 240 + this._watch.height * (i + 1))
            .attr("fill", 'lightgray');

        this._scrollConWatch.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.albumName)
            .attr('text-anchor', 'left')
            .style('font', '18px sans-serif')
            .attr('x', 45)
            .attr('y', (d, i) => 265 + this._watch.height * (i + 1))
            .attr("fill", 'lightgray');

        this._scrollConWatch.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => { return MusicPlayer.formatDuration(d.trackDuration); })
            .attr('text-anchor', 'left')
            .style('font', '18px sans-serif')
            .attr('x', 70)
            .attr('y', (d, i) => 290 + this._watch.height * (i + 1))
            .attr("fill", 'lightgray');

        this._overlayWatch.append('circle')
            .attr('cx', 180)
            .attr("cy", 70)
            .attr("r", 45)
            .attr("fill", "deepskyblue");

        this._overlayWatch.append('text')
            .text('PLAY')
            .attr('text-anchor', 'middle')
            .style('font', '24px sans-serif')
            .attr('x', 180)
            .attr('y', 78)
            .attr("fill", 'white');

        this._scrollConLoStrap.append('g').attr('id', 'strap-tracknames').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.trackName)
            .attr('text-anchor', 'left')
            .attr('x', 15)
            .style('font', '22px sans-serif')
            .attr('y', (d, i) => i * 80 + 22 + 20)
            .attr("fill", 'white');
        this._scrollConLoStrap.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.artistName + " - " + d.albumName)
            .attr('text-anchor', 'left')
            .attr('x', 15)
            .style('font', '16px sans-serif')
            .attr('y', (d, i) => i * 80 + 16 + 50)
            .attr("fill", 'gray');

        this._scrollStepSizeLoStrap = 80;
    }

    loadPlaylistOverview() {
        this.cleanInterface();
        this._curMode = MusicPlayer.modes.allPlaylists;

        this._scrollConWatch.append('g').selectAll('text')
            .data(this._playlists)
            .enter().append('text')
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .style('font', '24px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', (d, i) => 270 + this._watch.height * i)
            .attr("fill", 'white');  

        this._scrollConWatch.append('g').selectAll('text')
            .data(this._playlists)
            .enter().append('text')
            .text((d) => d.songs + " songs")
            .attr('text-anchor', 'middle')
            .style('font', '18px sans-serif')
            .attr('x', this._watch.width / 2)
            .attr('y', (d, i) => 300 + this._watch.height * i)
            .attr("fill", 'white');

        this._scrollConWatch.append('g').selectAll('image')
            .data(this._playlists)
            .enter().append('image')
            .attr("href", (d) => "/assets/music-player/covers/playlists/" + d.id + ".jpg")
            .attr('x', 100)
            .attr('y', (d, i) => 70 + this._watch.height * i)
            .attr('height', 160)
            .attr('width', 160);
        
        let listLo = this._scrollConLoStrap.selectAll('text')
            .data(this._playlists);

        listLo.enter()
            .append('text')
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .attr('x', this._loStrap.width / 2)
            .style('font', '22px sans-serif')
            .attr('y', (d, i) => (i - 1) * 70 + 30)
            .attr("fill", 'white');

        this._scrollStepSizeLoStrap = 70;
    }

    static formatDuration(ms) {
        let time = new Date(Number.parseInt(ms));
        return time.getMinutes() + ":" + (time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds());
    }

    static formatDate(dateString) {
        let date = new Date(dateString);
        return date.getDate() + "." + date.getMonth() + "." + date.getFullYear();
    }

    static randomCoverUrl() {
        let number = Math.floor(Math.random() * 49) + 1;
        let index = number < 10 ? "0" + number : "" + number;

        return "/assets/music-player/covers/songs/" + index + ".jpg";
    }

    loadControls() {
        this._upStrap.svg.append('image')
            .attr('id', 'play-pause')
            .attr("href", "/assets/music-player/icons/play_white_120x120.png")
            .attr('x', this._upStrap.width / 2 - 15)
            .attr('y', this._upStrap.height - 80)
            .attr('height', 30)
            .attr('width', 30)
            .on('mousedown', () => {
                console.log('down');
                if (this._curState === MusicPlayer.states.playing) {
                    this.pause();
                } else {
                    this.play();
                }
            });

        this._upStrap.svg.append('image')
            .attr("href", "/assets/music-player/icons/rev_white_120x120.png")
            .attr('x', this._upStrap.width / 4 - 12)
            .attr('y', this._upStrap.height - 77)
            .attr('height', 24)
            .attr('width', 24)
            .on('mousedown', () => this.prev());;

        this._upStrap.svg.append('image')
            .attr("href", "/assets/music-player/icons/skip_white_120x120.png")
            .attr('x', this._upStrap.width * 0.75 - 12)
            .attr('y', this._upStrap.height - 77)
            .attr('height', 24)
            .attr('width', 24)
            .on('mousedown', () => this.next());

        this._upStrap.svg.append('line')
            .attr('x1', 15)
            .attr('y1', this._upStrap.height - 100)
            .attr('x2', this._upStrap.width - 15)
            .attr('y2', this._upStrap.height - 100)
            .attr('stroke', 'gray');

        this._upStrap.svg.append('line')
            .attr('id', 'progress-line')
            .attr('x1', 15)
            .attr('y1', this._upStrap.height - 100)
            .attr('x2', 15)
            .attr('y2', this._upStrap.height - 100)
            .attr('stroke', 'deepskyblue')
            .attr('stroke-width', 2);

        this._upStrap.svg.append('circle')
            .attr('id', 'progress-circle')
            .attr('cx', 15)
            .attr('cy', this._upStrap.height - 100)
            .attr('r', 5)
            .attr('fill', 'deepskyblue');

        this._upStrap.svg.append('text')
            .text("Play: " + this._playlists[0].name)
            .attr('text-anchor', 'left')
            .attr('x', 15)
            .style('font', '18px sans-serif')
            .attr('y', this._upStrap.height - 18)
            .attr("fill", 'white');

        this.updateControls();
    }

    updateControls() {
        switch (this._curState) {
            case MusicPlayer.states.playing:
                let song = this._curPlaying[2][this._curPlaying[1]];
                this._upStrap.svg.select('text')
                    .text(song.trackName + " - " + song.artistName)
                    .attr("fill", "deepskyblue");
                this._upStrap.svg.select('#play-pause')
                    .attr("href", "/assets/music-player/icons/pause_white_120x120.png")
                this.updateProgress(new Date());
                this.highlightPlayingSong();
                break;
            case MusicPlayer.states.paused:
                this._upStrap.svg.select('#play-pause')
                    .attr("href", "/assets/music-player/icons/play_white_120x120.png")
                this._upStrap.svg.select('text')
                    .attr("fill", "white");
                break;
            case MusicPlayer.states.stopped:
                    switch (this._curMode) {
                        case MusicPlayer.modes.allPlaylists:
                            this._upStrap.svg.select('text').text("Play: " + this._playlists[this._curFocus].name);
                            break;
                        case MusicPlayer.modes.playlistView:
                            this._upStrap.svg.select('text').text("Play: " + this._playlists[this._lastPlaylistIndex].name);
                            break;
                        case MusicPlayer.modes.playQueue:
                            break;
                    }
                break;
        }
    }

    updateProgress(startTime) {
        if (this._pausedDuration) {
            startTime = startTime - this._pausedDuration;
            this._pausedDuration = undefined;
        }
        let timePassed = new Date() - startTime;
        this._timePassed = timePassed;
        let song = this._curPlaying[2][this._curPlaying[1]];
        let length = song.trackDuration;
        let x = (this._upStrap.width - 30) * (timePassed / length) + 15;

        if (length - timePassed > 200 && this._curState !== MusicPlayer.states.paused) {
            this._curTimer = setTimeout(() => this.updateProgress(startTime), 200);
        } else {
            x = this._upStrap.width - 15;
            setTimeout(() => this.next(), length - timePassed);
        }

        this._upStrap.svg.select('#progress-line')
            .attr('x2', x);
        this._upStrap.svg.select('#progress-circle')
            .attr('cx', x);  
    }

    highlightPlayingSong() {
        switch (this._curMode) {
            case MusicPlayer.modes.playlistView:
                if (this._lastPlaylistIndex === this._curPlaying[0]) {
                    this._scrollConLoStrap.select('#strap-tracknames').selectAll('text')
                        .attr("fill", "white");
                    this._scrollConLoStrap.select('#strap-tracknames').selectAll('text')
                        .filter((d, i) => i === this._curPlaying[1])
                        .attr("fill", "deepskyblue");

                    this._scrollConWatch.select('#watch-tracknames').selectAll('text')
                        .attr("fill", "white");
                    this._scrollConWatch.select('#watch-tracknames').selectAll('text')
                        .filter((d, i) => i === this._curPlaying[1])
                        .attr("fill", "deepskyblue");

                }
        }
    }

    play() {
        this._curState = MusicPlayer.states.playing;
        this.updateControls();
    }

    pause() {
        clearTimeout(this._curTimer);
        this._curTimer = undefined;
        this._curState = MusicPlayer.states.paused;
        let ratio = (this._upStrap.svg.select('#progress-line').attr('x2') - 15) / (this._upStrap.width - 30);
        this._pausedDuration = this._timePassed;
        this.updateControls();
    }

    next() {
        if (this._curState === MusicPlayer.states.stopped) {
            // check playlist in focus, play first song
        } else {
            if (this._curTimer) {
                clearTimeout(this._curTimer);
                this._curTimer = undefined;
            }
            this._curPlaying[1] = this._curPlaying[1] + 1;
            this.updateControls();
        }
    }

    prev() {

    }

    onWatchTouch() {
        console.log(this._watch.d3.event);
        if (this._curMode === MusicPlayer.modes.allPlaylists) {
            this.loadPlaylist(this._curFocus);
        } else if (this._curMode === MusicPlayer.modes.playlistView) {
            if (this._curTimer) {
                clearTimeout(this._curTimer);
                this._curTimer = undefined;
            }
            let curSong = this._curFocus === 0 ? 0 : this._curFocus - 1;
            this._curPlaying = [this._lastPlaylistIndex, curSong, this._lastPlaylist];
            this._curState = MusicPlayer.states.playing;
            this.updateControls();
        }
    }

    onBezelRotate(e) {
        let oldFocus = this._curFocus;
        let maxFocus;
        switch (this._curMode) {
            case MusicPlayer.modes.allPlaylists:
                maxFocus = this._playlists.length - 1;
                break;
            case MusicPlayer.modes.playlistView:
                maxFocus = this._playlists[this._lastPlaylistIndex].songs - 1;
                break;
            case MusicPlayer.modes.playQueue:
                break;
        }
        if (e.direction === "CW" && this._curFocus < maxFocus) {
            this._curFocus += 1;
        } else if (e.direction === "CCW" && this._curFocus >= 1) {
            this._curFocus -= 1;
        }

        let watchInter = this._watch.d3.interpolateNumber(
            -this._watch.height * (oldFocus),
            -this._watch.height * (this._curFocus));

        let loStrapInter = this._loStrap.d3.interpolateNumber(
            ((oldFocus) * -this._scrollStepSizeLoStrap),
            ((this._curFocus) * -this._scrollStepSizeLoStrap));

        let t = this._watch.d3.timer((elapsed) => {
            if (elapsed > 500) {
                t.stop();
                this._scrollConWatch.attr('transform', 'translate(0, ' + watchInter(1) + ')');
                this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
                return;
            }
            this._scrollConWatch.attr('transform', 'translate(0, ' + watchInter(elapsed / 500) + ')');
            this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(elapsed / 500) + ')');
            
        });
    }

    onHwkey(e) {
        if (e.key === "back") {
            switch (this._curMode) {
                case MusicPlayer.modes.allPlaylists:
                    let intent = new CustomEvent('intent', {detail: {type: 'close'}});
                    document.dispatchEvent(intent);
                    break;
                case MusicPlayer.modes.playlistView:
                    this.loadPlaylistOverview();
                    break;
                case MusicPlayer.modes.playQueue:
                    this.loadPlaylist(this._lastPlaylistIndex);
                    break;
            }            
        }
    }
}