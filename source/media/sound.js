Ambience.Sound = function(path, container, fade, maxVolume) {
	var node = document.createElement('audio');
	node.src = path;
	node.volume = maxVolume;
	fade.track(node, 'volume', maxVolume);
	
	var hasStopped = false;
	
	function play(callbacks) {
		node.addEventListener('ended', callbacks.onEnded);
		node.addEventListener('timeupdate', callbacks.onTimeUpdate);
		container.appendChild(node);
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
		}
	}
	
	return {
		play: play,
		stop: stop
	};
};