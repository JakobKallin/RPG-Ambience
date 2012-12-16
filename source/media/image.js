// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

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