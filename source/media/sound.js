Ambience.Sound = function(path, container) {
	var node = document.createElement('audio');
	node.src = encodeURI(path);
	node.volume = 0;
	
	var hasStopped = false;
	var fade = new Animation(node, 'volume');
	
	function play(fadeDuration, startVolume, endVolume, callbacks) {
		node.addEventListener('ended', callbacks.onEnded);
		node.addEventListener('timeupdate', callbacks.onTimeUpdate);
		node.volume = startVolume;
		fade.start(endVolume, fadeDuration);
		container.appendChild(node);
		node.play();
	}
	
	function fadeOut(duration) {
		if ( duration === undefined ) {
			duration = 0;
		}
		
		fade.start(0, duration);
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