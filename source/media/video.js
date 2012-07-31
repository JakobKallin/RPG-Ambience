Ambience.Video = function(container) {
	var scene;
	var node;
	var fade;
	
	function play(newScene) {
		scene = newScene;
		
		node = document.createElement('video');
		node.src = scene.video;
		node.volume = 0;
		node.className = 'video';
		
		fade =  new Animation(node, 'volume')
		fade.start(scene.volume, scene.fadeDuration);
		
		container.appendChild(node);
		node.play();
	}
	
	function fadeOut() {
		// The current volume compared to the scene's defined volume, if it has been halfway faded in.
		var volumePercentage = node.volume / scene.volume;
		var duration = scene.fadeDuration * volumePercentage
		fade.start(0, duration);
	}
	
	function stop() {
		fade.complete();
		if ( !node.ended ) {
			node.pause();
		}
		container.removeChild(node);
		
		scene = null;
	}
	
	return {
		play: play,
		fadeOut: fadeOut,
		stop: stop
	};
};