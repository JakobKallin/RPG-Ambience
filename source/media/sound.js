// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Sound = function(path, container, maxVolume, includeInFade, removeFromFade) {
	var node = document.createElement('audio');
	node.src = path;
	node.volume = maxVolume;
	includeInFade(node, 'volume', 0, maxVolume);
	
	var hasStopped = false;
	
	// If we play before the duration is known, crossover may occur immediately.
	function playWhenDurationKnown(callbacks) {
		container.appendChild(node);
		
		if ( node.readyState === 0 ) {
			node.addEventListener('loadedmetadata', function() {
				// Because this is asynchronous, check to make sure that the sound has not been stopped already.
				// Otherwise, several sounds might be playing at once if started between this function call and the loadedmetadata event.
				if ( !hasStopped ) {
					play(callbacks);
				}
			});
		} else {
			play(callbacks);
		}
	}
	
	function play(callbacks) {
		loadActualDuration(node);
		
		if ( callbacks.onEnded instanceof Array ) {			
			callbacks.onEnded.forEach(function(callback) {
				node.addEventListener('ended', callback);
			});
		} else {
			node.addEventListener('ended', callbacks.onEnded);
		}
		
		node.addEventListener('timeupdate', callbacks.onTimeUpdate);
		node.play();
	}
	
	function stop() {
		// Make sure that the sound is playing before stopping it, because the sound may already have been stopped after a one-shot audio-only scene.
		if ( !hasStopped ) {
			hasStopped = true;
			if ( !node.ended ) {
				try {
					node.currentTime = 0;
				} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
				node.pause();
			}
			container.removeChild(node);
			removeFromFade(node);
		}
	}
	
	// In Firefox, duration is not properly loaded from object URLs.
	// By setting currentTime too high, currentTime becomes the actual duration.
	// Since the duration property is immutable, we create a custom property with the actual duration.
	function loadActualDuration(node) {
		if ( isNaN(node.duration) || node.duration === Infinity ) {
			node.currentTime = 10000;
			node.actualDuration = node.currentTime;
			node.currentTime = 0;
		}
	}
	
	return {
		play: playWhenDurationKnown,
		stop: stop
	};
};