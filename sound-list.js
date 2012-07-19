Ambience.SoundList = function(stopScene) {
	var scene;
	var trackIndex;
	var sounds = [];
	var isCrossfading = false;
	
	function play(newScene) {
		scene = newScene;
		if ( scene.hasSound ) {
			trackIndex = -1; // -1 because the index is either incremented or randomized in the playNextTrack method.
			playNextTrack(0);
		}
	}
	
	function playNextTrack(fadeDuration) {
		// We need this so that we stop audio-only effects after they have actually played once.
		var hasPlayedBefore = trackIndex !== -1;
		
		if ( scene.soundOrder === 'random' ) {
			trackIndex = scene.soundPaths.randomIndex();
		} else {
			trackIndex = (trackIndex + 1) % scene.soundPaths.length;
		}
		
		var allTracksHavePlayed = hasPlayedBefore && trackIndex === 0;
		var oneShot = !scene.loops && scene.hasOnlySound;
		
		if ( oneShot && allTracksHavePlayed ) {
			stopScene();
		} else if ( scene.loops || !allTracksHavePlayed ) {
			var trackPath = scene.soundPaths[trackIndex];
			var sound = new Ambience.Sound(trackPath, scene.volume);
			sound.play(
				fadeDuration,
				{
					onTimeUpdate: onTimeUpdate,
					onEnded: function() {
						onTrackEnded(sound);
					}
				}
			);
			sounds.push(sound);
		}
	}
	
	function stop() {
		sounds.map(function(sound) { sound.abort(); });
		sounds = [];
		scene = null;
	}
	
	// Below, "this" refers to the <audio> element playing a sound.
	function onTimeUpdate() {
		var timeLeft = this.duration - this.currentTime;
		if ( timeLeft <= scene.crossfadeDuration ) {
			this.removeEventListener('timeupdate', onTimeUpdate);
			crossfade();
		}
	}
	
	// We should remove tracks from the list once they are done, so they don't take up space.
	function onTrackEnded(sound) {
		var index = sounds.indexOf(sound);
		sounds.splice(index, 1);
	}
	
	function crossfade() {
		sounds.map(function(sound) { sound.stop(scene.crossfadeDurationMillis); });
		playNextTrack(scene.crossfadeDurationMillis);
	}
	
	return {
		play: play,
		stop: stop
	};
};