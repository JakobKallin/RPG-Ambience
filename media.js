Ambience.Media = function(node, type, stopAudiovisual) {
	var audiovisual;
	var trackIndex;
	var fade = new Animation(node, 'volume');
	var hasEnded;
	var hasProperty = 'has' + type.capitalize();
	var hasOnlyProperty = 'hasOnly' + type.capitalize();
	var orderProperty = type + 'Order';
	var pathsProperty = type + 'Paths';

	node.addEventListener('ended', playNextTrack);
	
	function play(newAudiovisual) {
		audiovisual = newAudiovisual;
		// Locks up scene audio when effect both fades in and has audio for some reason. (Is this still true?)
		if ( audiovisual[hasProperty] ) {
			fade.start(audiovisual.volume, audiovisual.fadeInDuration);
			node.style.visibility = 'visible'; // This should have no effect for <audio>.
			// -1 because the index is either incremented or randomized in the playNextTrack method.
			trackIndex = -1;
			playNextTrack();
		}
	}
	
	function pause() {
		if ( audiovisual[hasProperty] && !hasEnded ) {
			node.pause();
			fade.pause();
		}	
	}
	
	function resume() {
		if ( audiovisual[hasProperty] && !hasEnded ) {
			node.play();
			fade.resume();
		}
	}
	
	function fadeOut() {
		// Must be above the stage fade, because that might complete immediately and set audiovisual to null.
		if ( audiovisual[hasProperty] ) {
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
		node.style.visibility = 'hidden';
		node.volume = 0; // We will fade this in later. (Is this needed after fade.complete() above?)
		
		audiovisual = null;
	}
	
	function playNextTrack() {
		if ( audiovisual ) {
			// We need this so that we stop audio-only effects after they have actually played once.
			var hasPlayedBefore = trackIndex !== -1;
			
			if ( audiovisual[orderProperty] === 'random' ) {
				trackIndex = audiovisual[pathsProperty].randomIndex();
			} else {
				trackIndex = (trackIndex + 1) % audiovisual[pathsProperty].length;
			}
			
			var allTracksHavePlayed = hasPlayedBefore && trackIndex === 0;
			var oneShot = !audiovisual.loops && !audiovisual[hasOnlyProperty];
			if ( oneShot && allTracksHavePlayed ) {
				stopAudiovisual();
			} else if ( allTracksHavePlayed && !audiovisual.loops  ) {
				hasEnded = true;
			} else {
				node.src = audiovisual[pathsProperty][trackIndex];
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