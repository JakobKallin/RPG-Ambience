Ambience.Sound = function(path, maxVolume, container) {
	var node = document.createElement('audio');
	node.src = path;
	node.volume = 0;
	
	var fade = new Animation(node, 'volume');
	
	function play(fadeDuration, callbacks) {
		node.addEventListener('ended', callbacks.onEnded);
		node.addEventListener('timeupdate', callbacks.onTimeUpdate);
		fade.start(maxVolume, fadeDuration);
		container.appendChild(node);
		node.play();
	}
	
	function stop(fadeDuration) {
		if ( fadeDuration === undefined ) {
			fadeDuration = 0;
		}
		
		// The current volume compared to the scene's defined volume, if it has been halfway faded in.
		var volumePercentage = node.volume / maxVolume;
		var duration = fadeDuration * volumePercentage
		fade.start(0, duration, {onCompleted: abort});
	}
	
	function abort() {
		fade.complete();
		if ( !node.ended ) {
			try {
				node.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			node.pause();
		}
		container.removeChild(node);
	}
	
	return {
		play: play,
		stop: stop,
		abort: abort
	};
};