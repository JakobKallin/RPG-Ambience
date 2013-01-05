// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Sound = function(container, stopSceneIfSoundOnly, includeInFade, removeFromFade) {
	var scene;
	var trackIndex;
	var tracks = [];
	
	function play(newScene) {
		scene = newScene;
		
		trackIndex = -1; // -1 because the index is either incremented or randomized in the playNextTrack method.
		playNextTrack();
	}
	
	function playNextTrack() {
		// We need this so that we stop audio-only effects after they have actually played once.
		var hasPlayedBefore = trackIndex !== -1;
		
		if ( scene.sound.shuffle ) {
			trackIndex = scene.sound.tracks.randomIndex();
		} else {
			trackIndex = (trackIndex + 1) % scene.sound.tracks.length;
		}
		
		var allTracksHavePlayed = hasPlayedBefore && trackIndex === 0;
		// Below, <scene> might be old (if another scene has been mixed-in).
		// This doesn't matter here, however, because <stopSceneIfSoundOnly> checks whether the scene actually has sound right now.
		var oneShot = !scene.sound.loop && scene.hasOnlySound;
		
		if ( oneShot && allTracksHavePlayed ) {
			stopSceneIfSoundOnly();
		} else if ( scene.sound.loop || !allTracksHavePlayed ) {
			var trackPath = scene.sound.tracks[trackIndex];
			var track = new Ambience.Track(trackPath, container, scene.sound.volume, includeInFade, removeFromFade);
			var onEnded = [function() { removeTrack(track); }, playNextTrack];
			
			track.play({ onTimeUpdate: onTimeUpdate, onEnded: onEnded });
			tracks.push(track);
		}
	}
	
	function stop() {
		tracks.map(function(track) { track.stop(); });
		tracks = [];
		scene = null;
	}
	
	// Below, "this" refers to the <audio> element playing a sound.
	function onTimeUpdate() {
		// This event seems to sometimes fire after the scene has been removed, so we need to check for a scene to avoid null pointers.
		if ( scene ) {
			var duration = this.actualDuration || this.duration;
			var timeLeft = duration - this.currentTime;
			if ( timeLeft <= scene.sound.overlap ) {
				this.removeEventListener('timeupdate', onTimeUpdate);
				this.removeEventListener('ended', playNextTrack)
				playNextTrack();
			}
		}
	}
	
	// We should remove tracks from the list once they are done, so they don't take up space.
	function removeTrack(track) {
		track.stop(); // This is important because it removes the <audio> element.
		var index = tracks.indexOf(track);
		tracks.splice(index, 1);
	}
	
	return {
		play: play,
		stop: stop
	};
};