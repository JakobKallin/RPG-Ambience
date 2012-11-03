Ambience.SoundList = function(container, stopSceneIfSoundOnly) {
	var scene;
	var trackIndex;
	var sounds = [];
	var fade;
	
	function play(newScene, newFade) {
		scene = newScene;
		fade = newFade;
		
		trackIndex = -1; // -1 because the index is either incremented or randomized in the playNextTrack method.
		playNextTrack(fade);
	}
	
	function playNextTrack(fade) {
		// We need this so that we stop audio-only effects after they have actually played once.
		var hasPlayedBefore = trackIndex !== -1;
		
		if ( scene.soundOrder === 'random' ) {
			trackIndex = scene.sounds.randomIndex();
		} else {
			trackIndex = (trackIndex + 1) % scene.sounds.length;
		}
		
		var allTracksHavePlayed = hasPlayedBefore && trackIndex === 0;
		var oneShot = !scene.loops && scene.hasOnlySound;
		
		if ( oneShot && allTracksHavePlayed ) {
			stopSceneIfSoundOnly();
		} else if ( scene.loops || !allTracksHavePlayed ) {
			var trackPath = scene.sounds[trackIndex];
			var sound = new Ambience.Sound(trackPath, container, fade, scene.volume);
			var onEnded = function() { onTrackEnded(sound); };
			
			sound.play({ onTimeUpdate: onTimeUpdate, onEnded: onEnded });
			sounds.push(sound);
		}
	}
	
	function stop() {
		sounds.map(function(sound) { sound.stop(); });
		sounds = [];
		scene = null;
		fade = null;
	}
	
	// Below, "this" refers to the <audio> element playing a sound.
	function onTimeUpdate() {
		// This event seems to sometimes fire after the scene has been removed, so we need to check for a scene to avoid null pointers.
		if ( scene ) {
			var timeLeft = this.duration - this.currentTime;
			if ( timeLeft <= scene.crossoverDuration ) {
				this.removeEventListener('timeupdate', onTimeUpdate);
				crossover();
			}
		}
	}
	
	// We should remove tracks from the list once they are done, so they don't take up space.
	function onTrackEnded(sound) {
		sound.stop(); // This is important because it removes the <audio> element.
		var index = sounds.indexOf(sound);
		sounds.splice(index, 1);
	}
	
	function crossover() {
		// New track starts early but does not fade in.
		// Likewise, current track does not fade out but simply ends normally (with onTrackEnded eventually removing it).
		playNextTrack(fade);
	}
	
	return {
		play: play,
		stop: stop
	};
};