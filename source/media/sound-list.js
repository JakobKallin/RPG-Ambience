Ambience.SoundList = function(container, stopSceneIfSoundOnly) {
	var scene;
	var trackIndex;
	var sounds = [];
	
	// Dummy animation object used for tracking what state sound objects should be in.
	var state = { volume: 0 };
	var fade = new Animation(state, 'volume');
	
	function play(newScene) {
		scene = newScene;
		
		fade.start(scene.volume, scene.fadeInDuration)
		trackIndex = -1; // -1 because the index is either incremented or randomized in the playNextTrack method.
		playNextTrack();
	}
	
	function playNextTrack() {
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
			var sound = new Ambience.Sound(trackPath, container);
			var onEnded = function() { onTrackEnded(sound); };
			
			sound.play(fade.remaining, state.volume, fade.endValue, { onTimeUpdate: onTimeUpdate, onEnded: onEnded});
			sounds.push(sound);
		}
	}
	
	function fadeOut() {
		fade.start(0, scene.fadeOutDuration, { onEnded: stop });
		sounds.map(function(sound) { sound.fadeOut(scene.fadeOutDuration); });
	}
	
	function stop() {
		sounds.map(function(sound) { sound.stop(); });
		sounds = [];
		scene = null;
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
		playNextTrack();
	}
	
	return {
		play: play,
		fadeOut: fadeOut,
		stop: stop
	};
};