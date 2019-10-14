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
    _curPlaying = {
        listIndex: undefined,
        songIndex: undefined,
        list: undefined
    };
    _lastPlaylistIndex = 0;
    _lastPlaylist;
    _scrollStepSizeLoStrap = 0;
    _pausedDuration;
    _curTimer;
    _timePassed;
    _fontSize;

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

        this._upCon = this._upStrap.svg.append('g');
        this._backgroundWatch = this._watch.svg.append('g').attr('id', 'backgroundWatch');
        this._scrollConWatch = this._watch.svg.append('g').attr('id', 'scrollConWatch');
        this._scrollConLoStrap = this._loStrap.svg.append('g').attr('id', 'scrollConLoStrap');
        this._overlayWatch = this._watch.svg.append('g').attr('id', 'overlayWatch');
        this._overlayLoStrap = this._loStrap.svg.append('g').attr('id', 'overlayLoStrap');

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
        this._overlayLoStrap.remove()
        
        this._backgroundWatch = this._watch.svg.append('g').attr('id', 'backgroundWatch');
        this._scrollConWatch = this._watch.svg.append('g').attr('id', 'scrollConWatch');
        this._scrollConLoStrap = this._loStrap.svg.append('g').attr('id', 'scrollConLoStrap');
        this._overlayWatch = this._watch.svg.append('g').attr('id', 'overlayWatch');
        this._overlayLoStrap = this._loStrap.svg.append('g').attr('id', 'overlayLoStrap');
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
            .style('font', this._watch.font('large'))
            .attr('x', this._watch.width / 2)
            .attr('y', 170)
            .attr("fill", 'white');  

        this._scrollConWatch.append('text')
            .text(this._playlists[playlistIndex].songs + " songs")
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('small'))
            .attr('x', this._watch.width / 2)
            .attr('y', 220)
            .attr("fill", 'white');

        this._scrollConWatch.append('text')
            .text("Created: " + MusicPlayer.formatDate(data[0].addedAt))
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('small'))
            .attr('x', this._watch.width / 2)
            .attr('y', 260)
            .attr("fill", 'white');
        
        this._scrollConWatch.append('g').selectAll('image')
            .data(data)
            .enter().append('image')
            .attr("href", () => MusicPlayer.randomCoverUrl())
            .attr('x', 0)
            .attr('y', (d, i) => this._watch.height * (i + 1))
            .attr('height', 360)
            .attr('width', 360);

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
            .style('font', this._watch.font('normal'))
            .attr('x', 15)
            .attr('y', (d, i) => 210 + this._watch.height * (i + 1))
            .attr("fill", 'white');

        this._scrollConWatch.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.artistName)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('small'))
            .attr('x', 30)
            .attr('y', (d, i) => 240 + this._watch.height * (i + 1))
            .attr("fill", 'lightgray');

        this._scrollConWatch.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.albumName)
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('small'))
            .attr('x', 45)
            .attr('y', (d, i) => 265 + this._watch.height * (i + 1))
            .attr("fill", 'lightgray');

        this._scrollConWatch.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => { return MusicPlayer.formatDuration(d.trackDuration); })
            .attr('text-anchor', 'left')
            .style('font', this._watch.font('small'))
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
            .style('font', this._watch.font('normal'))
            .attr('x', 180)
            .attr('y', 78)
            .attr("fill", 'white');

        this._scrollConLoStrap.append('g').attr('id', 'strap-tracknames').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.trackName)
            .attr('text-anchor', 'left')
            .attr('x', this._loStrap.width * 0.05)
            .style('font', this._loStrap.font('normal'))
            .attr('y', (d, i) => (i * this._loStrap.fontSize('normal') * 3.5) + this._loStrap.fontSize('normal') * 2)
            .attr("fill", 'white');
        this._scrollConLoStrap.append('g').selectAll('text')
            .data(data)
            .enter().append('text')
            .text((d) => d.artistName + " - " + d.albumName)
            .attr('text-anchor', 'left')
            .attr('x', this._loStrap.width * 0.05)
            .style('font', this._loStrap.font('small'))
            .attr('y', (d, i) => (i * this._loStrap.fontSize('normal') * 3.5) + this._loStrap.fontSize('small') * 1.5 + this._loStrap.fontSize('normal') * 2)
            .attr("fill", this._loStrap.colorMode === 'bw' ? 'white' : 'gray');

        
        this._scrollStepSizeLoStrap = this._loStrap.fontSize('normal') * 3.5;

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
                if (index >= this._curPlaying.list.length)
                    return;

                this._curState = MusicPlayer.states.playing;
                this._curPlaying.songIndex = index;
                if (this._curTimer) {
                    clearTimeout(this._curTimer);
                    this._curTimer = undefined;
                }
                this.updateControls();
            });
        }

        this._curPlaying.listIndex = this._lastPlaylistIndex;
        this._curPlaying.songIndex = 0;
        this._curPlaying.list = this._lastPlaylist;
    }

    loadPlaylistOverview() {
        this.cleanInterface();
        this._curMode = MusicPlayer.modes.allPlaylists;

        this._scrollConWatch.append('g').selectAll('text')
            .data(this._playlists)
            .enter().append('text')
            .text((d) => d.name)
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('normal'))
            .attr('x', this._watch.width / 2)
            .attr('y', (d, i) => 270 + this._watch.height * i)
            .attr("fill", 'white');  

        this._scrollConWatch.append('g').selectAll('text')
            .data(this._playlists)
            .enter().append('text')
            .text((d) => d.songs + " songs")
            .attr('text-anchor', 'middle')
            .style('font', this._watch.font('small'))
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
            .style('font', this._loStrap.font('normal'))
            .attr('y', (d, i) => (i - 1) * 70 + 40)
            .attr("fill", 'white');

        this._scrollStepSizeLoStrap = 70;

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
                let index = this._curFocus + i + 1;
                if (index >= this._playlists.length)
                    return;

                this.loadPlaylist(index);
            });
        }
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
        let controlSizeLg = this._upStrap.width / 5;
        let controlSizeMd = this._upStrap.width / 6;
        this._upCon.append('image')
            .attr('id', 'play-pause')
            .attr("href", "/assets/music-player/icons/play_white_120x120.png")
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('x', this._upStrap.width / 2 - controlSizeLg / 2)
            .attr('y', -this._upStrap.height * .22)
            .attr('height', controlSizeLg)
            .attr('width', controlSizeLg)
            .on('mousedown', () => {
                if (this._curState === MusicPlayer.states.playing) {
                    this.pause();
                } else {
                    this.play();
                }
            });

        this._upCon.append('image')
            .attr("href", "/assets/music-player/icons/rev_white_120x120.png")
            .attr('x', this._upStrap.width / 4 - controlSizeMd / 2)
            .attr('y', -this._upStrap.height * .22 + (controlSizeLg - controlSizeMd) / 2)
            .attr('height', controlSizeMd)
            .attr('width', controlSizeMd)
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .on('mousedown', () => this.prev());

        this._upCon.append('image')
            .attr("href", "/assets/music-player/icons/skip_white_120x120.png")
            .attr('x', this._upStrap.width * 0.75 - controlSizeMd / 2)
            .attr('y', -this._upStrap.height * .22 + (controlSizeLg - controlSizeMd) / 2)
            .attr('height', controlSizeMd)
            .attr('width', controlSizeMd)
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .on('mousedown', () => this.next());

        this._upCon.append('line')
            .attr('x1', this._upStrap.width - this._upStrap.width * 0.1)
            .attr('y1', this._upStrap.height * 0.05)
            .attr('x2', this._upStrap.width * 0.1)
            .attr('y2', this._upStrap.height * 0.05)
            .attr('stroke', this._upStrap.colorMode === 'bw' ? 'white' : 'gray')
            .attr('stroke-width', 2);

        this._upCon.append('line')
            .attr('id', 'progress-line')
            .attr('x1', this._upStrap.width - this._upStrap.width * 0.1)
            .attr('y1', this._upStrap.height * 0.05)
            .attr('x2', this._upStrap.width - this._upStrap.width * 0.1)
            .attr('y2', this._upStrap.height * 0.05)
            .attr('stroke', this._upStrap.colorMode === 'bw' ? 'white' : 'deepskyblue')
            .attr('stroke-width', this._upStrap.colorMode === 'bw' ? 4 : 2);

        this._upCon.append('circle')
            .attr('id', 'progress-circle')
            .attr('cx', this._upStrap.width - this._upStrap.width * 0.1)
            .attr('cy', this._upStrap.height * 0.05)
            .attr('r', this._upStrap.width * 0.05)
            .attr('fill', this._upStrap.colorMode === 'bw' ? 'white' : 'deepskyblue');

        this._upCon.append('text')
            .text("Play: " + this._playlists[0].name)
            .attr('text-anchor', 'left')
            .attr('x', this._upStrap.width * 0.05)
            .style('font', this._upStrap.font('small'))
            .attr('transform', 'rotate(180) translate(' + this._upStrap.width + ', 0)')
            .attr('y', -this._upStrap.height * .3)
            .attr("fill", 'white');

        this._upCon.append('rect')
            .attr('x', this._upStrap.width * 0.66)
            .attr('y', this._upStrap.height * .22 - controlSizeMd * 1.5)
            .attr('height', controlSizeMd * 2)
            .attr('width', this._upStrap.width / 3)
            .attr('fill-opacity', 0)
            .on('mousedown', () => this.prev());

        this._upCon.append('rect')
            .attr('x', this._upStrap.width * 0.33)
            .attr('y', this._upStrap.height * .22 - controlSizeLg * 1.5)
            .attr('height', controlSizeLg * 2)
            .attr('width', this._upStrap.width / 3)
            .attr('fill-opacity', 0)
            .on('mousedown', () => {
                    if (this._curState === MusicPlayer.states.playing) {
                    this.pause();
                } else {
                    this.play();
                }
            });

            this._upCon.append('rect')
            .attr('x', 0)
            .attr('y', this._upStrap.height * .22 - controlSizeMd * 1.5)
            .attr('height', controlSizeMd * 2)
            .attr('width', this._upStrap.width / 3)
            .attr('fill-opacity', 0)
            .on('mousedown', () => this.next());

        this.updateControls();
    }

    updateControls() {
        switch (this._curState) {
            case MusicPlayer.states.playing: 
                var song = this._curPlaying.list[this._curPlaying.songIndex];
                this._upCon.select('text')
                    .text(song.trackName + " - " + song.artistName)
                    .attr("fill", this._upStrap.colorMode === 'bw' ? 'white' : "deepskyblue");
                this._upCon.select('#play-pause')
                    .attr("href", "/assets/music-player/icons/pause_white_120x120.png")
                this.updateProgress(new Date());
                this.highlightPlayingSong();
                break;
            case MusicPlayer.states.paused:
                this._upCon.select('#play-pause')
                    .attr("href", "/assets/music-player/icons/play_white_120x120.png")
                this._upCon.select('text')
                    .attr("fill", "white");
                break;
            case MusicPlayer.states.stopped:
                    this._upCon.select('text').text('No song selected...');
                    // switch (this._curMode) {
                    //     case MusicPlayer.modes.allPlaylists:
                    //         this._upCon.select('text').text("Play: " + this._playlists[this._curFocus].name);
                    //         break;
                    //     case MusicPlayer.modes.playlistView:
                    //         this._upCon.select('text').text("Play: " + this._playlists[this._lastPlaylistIndex].name);
                    //         break;
                    //     case MusicPlayer.modes.playQueue:
                    //         break;
                    // }
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
        let song = this._curPlaying.list[this._curPlaying.songIndex];
        let length = song.trackDuration;
        let x = (this._upStrap.width - this._upStrap.width * 0.1) - (this._upStrap.width - (this._upStrap.width * 0.1 * 2)) * (timePassed / length);

        let updateInterval = this._upStrap.type === "eink" ? 1000 : 200;

        if (length - timePassed > updateInterval && this._curState !== MusicPlayer.states.paused) {
            this._curTimer = setTimeout(() => this.updateProgress(startTime), updateInterval);
        } else {
            x = 15;
            setTimeout(() => this.next(), length - timePassed);
        }

        this._upCon.select('#progress-line')
            .attr('x2', x);
        this._upCon.select('#progress-circle')
            .attr('cx', x);  
    }

    highlightPlayingSong() {
        switch (this._curMode) {
            case MusicPlayer.modes.playlistView:
                if (this._lastPlaylistIndex === this._curPlaying.listIndex) {
                    this._scrollConLoStrap.select('#strap-tracknames').selectAll('text')
                        .attr("fill", "white")
                        .style('font', this._loStrap.font('normal'));
                    this._scrollConLoStrap.select('#strap-tracknames').selectAll('text')
                        .filter((d, i) => i === this._curPlaying.songIndex)
                        .attr("fill", this._loStrap.colorMode === 'bw' ? 'white' : "deepskyblue")
                        .style('font', this._loStrap.font('normal', 'bold'));

                    this._scrollConWatch.select('#watch-tracknames').selectAll('text')
                        .attr("fill", "white");
                    this._scrollConWatch.select('#watch-tracknames').selectAll('text')
                        .filter((d, i) => i === this._curPlaying.songIndex)
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
        this._pausedDuration = this._timePassed;
        this.updateControls();
    }

    next() {
        if (this._curState === MusicPlayer.states.stopped) {
            // check playlist in focus, play first song
            this._curState = MusicPlayer.states.playing;
            this._curPlaying.songIndex = this._curPlaying.songIndex + 1;
            this.updateControls();
        } else {
            if (this._curTimer) {
                clearTimeout(this._curTimer);
                this._curTimer = undefined;
            }
            if (this._curPlaying.songIndex < this._curPlaying.list.length)
                this._curPlaying.songIndex = this._curPlaying.songIndex + 1;
            this.updateControls();
        }
    }

    prev() {
        if (this._curState === MusicPlayer.states.stopped) {
            // check playlist in focus, play first song
            this._curState = MusicPlayer.states.playing;
            this.updateControls();
        } else if (this._curState === MusicPlayer.states.playing) {
            if (this._curTimer) {
                clearTimeout(this._curTimer);
                this._curTimer = undefined;
            }
            if (this._curPlaying.songIndex > 0)
                this._curPlaying.songIndex = this._curPlaying.songIndex - 1;
            this.updateControls();
        }
    }

    onWatchTouch() {
        if (this._curMode === MusicPlayer.modes.allPlaylists) {
            this.loadPlaylist(this._curFocus);
        } else if (this._curMode === MusicPlayer.modes.playlistView) {
            if (this._curTimer) {
                clearTimeout(this._curTimer);
                this._curTimer = undefined;
            }
            let curSong = this._curFocus === 0 ? 0 : this._curFocus - 1;
            this._curPlaying.listIndex = this._lastPlaylistIndex;
            this._curPlaying.songIndex = curSong;
            this._curPlaying.list = this._lastPlaylist;
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
                if (this._loStrap.type !== 'eink')
                    this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
                return;
            }
            this._scrollConWatch.attr('transform', 'translate(0, ' + watchInter(elapsed / 500) + ')');
            if (this._loStrap.type !== 'eink')
                this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(elapsed / 500) + ')');
            
        });

        if (this._loStrap.type === 'eink')
            this._scrollConLoStrap.attr('transform', 'translate(0, ' + loStrapInter(1) + ')');
    }

    onHwkey(e) {
        if (e.key === "back") {
            switch (this._curMode) {
                case MusicPlayer.modes.allPlaylists:
                    var intent = new CustomEvent('intent', {detail: {type: 'close'}});
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