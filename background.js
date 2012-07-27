Ambience.Background = function(node) {
	var scene;
	var defaultBackground = document.body.style.backgroundColor;
	
	function play(newScene) {
		scene = newScene;
		
		if ( scene.backgroundColor ) {
			node.style.backgroundColor = scene.backgroundColor;
		}
	}
	
	function reset() {
		node.style.backgroundColor = defaultBackground;
		
		scene = null;
	}
	
	return {
		play: play,
		reset: reset
	};
};