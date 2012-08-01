Ambience.Sound = function(path, maxVolume, container) {
	var node = document.createElement('audio');
	node.src = path;
	node.volume = 0;
	
	var hasStopped = false;
	var fade = new Animation(node, 'volume');
	
	function play(fadeDuration, callbacks) {
		node.addEventListener('ended', callbacks.onEnded);
		node.addEventListener('timeupdate', callbacks.onTimeUpdate);
		fade.start(maxVolume, fadeDuration);
		container.appendChild(node);
		node.play();
	}
	
	function fadeOut(duration) {
		if ( duration === undefined ) {
			duration = 0;
		}
		
		// The current volume compared to the scene's defined volume, if it has been halfway faded in.
		var volumePercentage = node.volume / maxVolume;
		var actualDuration = duration * volumePercentage
		fade.start(0, actualDuration);
	}
	
	function stop() {
		// Make sure that the sound is playing before stopping it, because the sound may already have been stopped after a one-shot audio-only scene.
		if ( !hasStopped ) {
			hasStopped = true;
			
			fade.complete();
			if ( !node.ended ) {
				try {
					node.currentTime = 0;
				} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
				node.pause();
			}
			container.removeChild(node);
		}
	}
	
	return {
		play: play,
		fadeOut: fadeOut,
		stop: stop
	};
};