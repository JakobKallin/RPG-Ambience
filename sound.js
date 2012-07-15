Ambience.Sound = function(node) {
	var audiovisual;
	var trackIndex;
	var fade = new Animation(node, 'volume');
	var hasEnded;

	node.addEventListener('ended', playNextSound);
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
		// Locks up scene audio when effect both fades in and has audio for some reason.
		if ( audiovisual.hasSound ) {
			fade.start(audiovisual.volume, audiovisual.fadeInDuration);
			// -1 because the index is either incremented or randomized in the playNextSound method.
			trackIndex = -1;
			playNextSound();
		}
	}
	
	function pause() {
		if ( audiovisual.hasSound && !hasEnded ) {
			node.pause();
			fade.pause();
		}	
	}
	
	function resume() {
		if ( audiovisual.hasSound && !hasEnded ) {
			node.play();
			fade.resume();
		}
	}
	
	function fadeOut() {		
		// Must be above the stage fade, because that might complete immediately and set audiovisual to null.
		if ( audiovisual.hasSound ) {
			// The current volume compared to the audiovisual's defined volume, if it has been halfway faded in.
			var volumePercentage = node.volume / audiovisual.volume;
			var duration = audiovisual.fadeOutDuration * volumePercentage;
			fade.start(0, duration);
		}
	}
	
	function reset() {
		trackIndex = null;
		hasEnded = false;
		
		if ( !node.ended ) {
			try {
				node.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			node.pause();
		}
		fade.complete();
		node.removeAttribute('src');
		node.volume = 0; // We will fade this in later. (Is this needed after fade.complete() above?)
	}
	
	function playNextSound() {
		if ( audiovisual ) {
			// We need this so that we stop audio-only effects after they have actually played once.
			var hasPlayedBefore = trackIndex !== -1;
			
			if ( audiovisual.soundOrder === 'random' ) {
				trackIndex = audiovisual.soundPaths.randomIndex();
			} else {
				trackIndex = (trackIndex + 1) % audiovisual.soundPaths.length;
			}
			
			var allSoundsHavePlayed = hasPlayedBefore && trackIndex === 0;
			var oneShotAudioOnly = !audiovisual.loops && !audiovisual.isVisual;
			if ( oneShotAudioOnly && allSoundsHavePlayed ) {
				reset();
			} else if ( allSoundsHavePlayed && !audiovisual.loops  ) {
				hasEnded = true;
			} else {
				node.src = audiovisual.soundPaths[trackIndex];
				node.play();
			}
		}
	}
	
	return {
		play: play,
		pause: pause,
		resume: resume,
		fadeOut: fadeOut,
		reset: reset,
		get hasEnded() {
			return hasEnded;
		}
	};
};