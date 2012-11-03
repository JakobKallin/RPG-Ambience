Ambience.Image = function(container) {
	var node;
	
	function play(scene) {
		node = document.createElement('div');
		node.className = 'image';
		container.insertBefore(node, container.firstChild);
	
		node.style.backgroundImage = 'url("' + scene.image + '")';
		
		for ( var property in scene.imageStyle ) {
			var value = scene.imageStyle[property];
			node.style[property] = value;
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