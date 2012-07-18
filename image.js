Ambience.Image = function(node) {
	var scene;
	
	function play(newScene) {
		scene = newScene;
		
		if ( scene.hasImage ) {
			node.style.backgroundImage = 'url("' + scene.imagePath + '")';
		}
		
		for ( var property in scene.imageStyle ) {
			var cssValue = scene.imageStyle[property];
			var cssProperty = 'background-' + property;
			node.style[cssProperty] = cssValue;
		}
	}
	
	function reset() {
		node.style.backgroundImage = '';
		
		if ( scene && 'imageStyle' in scene ) {
			for ( var property in scene.imageStyle ) {
				var cssProperty = 'background-' + property;
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