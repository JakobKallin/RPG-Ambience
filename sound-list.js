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
		if ( scene.soundOrder === 'random' ) {
			trackIndex = scene.soundPaths.randomIndex();
		} else {
			trackIndex = (trackIndex + 1) % scene.soundPaths.length;
		}
		
		var trackPath = scene.soundPaths[trackIndex];
		var sound = new Ambience.Sound(trackPath, scene.volume);
		sound.play(fadeDuration, {onTimeUpdate: onTimeUpdate});
		sounds.push(sound);
	}
	
	function stop() {
		sounds.map(function(sound) { sound.abort(); });
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
	
	function crossfade() {
		sounds.map(function(sound) { sound.stop(scene.crossfadeDurationMillis); });
		playNextTrack(scene.crossfadeDurationMillis);
	}
	
	return {
		play: play,
		stop: stop
	};
};