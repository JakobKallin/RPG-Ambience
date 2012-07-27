Ambience.Background = function(node) {
	var defaultBackground = document.body.style.backgroundColor;
	
	function play(scene) {
		if ( scene.backgroundColor ) {
			node.style.backgroundColor = scene.backgroundColor;
		}
	}
	
	function stop() {
		node.style.backgroundColor = defaultBackground;
	}
	
	return {
		play: play,
		stop: stop
	};
};