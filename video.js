Ambience.Video = function(node) {
	var scene;
	node.volume = 0;
	var fade = new Animation(node, 'volume');
	
	function play(newScene) {
		scene = newScene;
		if ( scene.hasVideo ) {
			node.src = scene.videoPath;
			fade.start(scene.volume, scene.fadeDuration);
			node.play();
		}
	}
	
	function stop() {
		if ( scene ) {
			// The current volume compared to the scene's defined volume, if it has been halfway faded in.
			var volumePercentage = node.volume / scene.volume;
			var duration = scene.fadeDuration * volumePercentage
			fade.start(0, duration, {onCompleted: abort});
		}
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