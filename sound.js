Ambience.Sound = function(path, maxVolume) {
	var node = document.createElement('audio');
	node.src = path;
	node.volume = maxVolume;
	
	var fade = new Animation(node, 'volume');
	
	function play(fadeDuration, onEnded) {
		node.addEventListener('ended', onEnded);
		fade.start(maxVolume, fadeDuration);
		node.play();
	}
	
	function stop(fadeDuration) {
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
	}
	
	return {
		play: play,
		stop: stop,
		abort: abort
	};
};