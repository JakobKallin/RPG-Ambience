Ambience.Image = function(container) {
	var scene;
	var node;
	
	function play(newScene) {
		scene = newScene;
		
		if ( scene.hasImage ) {
			node = document.createElement('div');
			node.className = 'image';
			container.insertBefore(node, container.firstChild);
		
			node.style.backgroundImage = 'url("' + scene.imagePath + '")';
		
		
			for ( var property in scene.imageStyle ) {
				var cssValue = scene.imageStyle[property];
				// Needs to be camelcase to work in Firefox and possibly other browsers.
				var cssProperty = 'background-' + property;
				node.style[cssProperty] = cssValue;
			}
		}
	}
	
	function stop() {
		if ( scene.hasImage ) {
			container.removeChild(node);
			node = null;
		}
		
		scene = null;
	}
	
	return {
		play: play,
		stop: stop
	};
};