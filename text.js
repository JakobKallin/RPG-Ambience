Ambience.Text = function(node) {
	var scene;
	
	function play(newScene) {
		scene = newScene;
		
		if ( scene.hasText ) {
			node.textContent = scene.text;
			for ( var cssProperty in scene.textStyle ) {
				var cssValue = scene.textStyle[cssProperty];
				node.style[cssProperty] = cssValue;
			}
		}
	}
	
	function reset() {
		node.textContent = '';
		
		if ( scene && scene.hasTextStyle ) {
			for ( var cssProperty in scene.textStyle ) {
				node.style[cssProperty] = '';
			}
		}
		
		scene = null;
	}
	
	return {
		play: play,
		reset: reset
	};
};