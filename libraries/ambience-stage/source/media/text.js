// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Text = function(container) {
	var outerNode; // This one is needed to have left-aligned text in the center, without filling the entire width.
	var innerNode;
	
	function play(scene) {
		outerNode = document.createElement('div');
		outerNode.className = 'text outer';
		innerNode = document.createElement('div');
		innerNode.className = 'text inner';
		outerNode.appendChild(innerNode);
		
		innerNode.textContent = scene.text.string;
		for ( var property in scene.text.style ) {
			var value = scene.text.style[property];
			innerNode.style[property] = value;
		}
		
		container.appendChild(outerNode);
	}
	
	function stop() {
		container.removeChild(outerNode);
		outerNode = null;
		innerNode = null;
	}
	
	return {
		play: play,
		stop: stop
	};
};