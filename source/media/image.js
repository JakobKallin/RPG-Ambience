Ambience.Image = function(container) {
	var node;
	
	function play(scene) {
		node = document.createElement('div');
		node.className = 'image';
		container.insertBefore(node, container.firstChild);
	
		node.style.backgroundImage = 'url("' + encodeURI(scene.image) + '")';
		
		for ( var property in scene.imageStyle ) {
			var cssValue = scene.imageStyle[property];
			// Needs to be camelcase to work in Firefox and possibly other browsers.
			var cssProperty = 'background-' + property;
			node.style[cssProperty] = cssValue;
		}
	}
	
	function stop() {
		container.removeChild(node);
		node = null;
	}
	
	return {
		play: play,
		stop: stop
	};
};