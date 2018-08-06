// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

AmbienceStage.Text = function(container) {
	var doc = container.ownerDocument;
	var outerNode; // This one is needed to have left-aligned text in the center, without filling the entire width.
	var innerNode;
	
	function play(scene) {
		outerNode = doc.createElement('div');
		outerNode.className = 'text outer';
		innerNode = doc.createElement('div');
		innerNode.className = 'text inner';
		outerNode.appendChild(innerNode);
		
		if ( scene.text.string ) {
			innerNode.textContent = scene.text.string;
		} else {
			throw new Error('Text object must have a "string" property.')
		}
		
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