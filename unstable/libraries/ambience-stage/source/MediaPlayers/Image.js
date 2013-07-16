// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

AmbienceStage.Image = function(container) {
	var node;
	
	function play(scene) {
		node = document.createElement('div');
		node.className = 'image';
		container.insertBefore(node, container.firstChild);

		node.style.backgroundImage = 'url("' + scene.image.url + '")';
		
		for ( var property in scene.image.style ) {
			var value = scene.image.style[property];
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