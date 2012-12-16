// This file is part of RPG Ambience
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Background = function(node) {
	var defaultBackground = Ambience.Scene.base.backgroundColor;
	
	function play(scene) {
		if ( scene.backgroundColor ) {
			node.style.backgroundColor = scene.backgroundColor;
		}
	}
	
	function stop() {
		node.style.backgroundColor = defaultBackground;
	}
	
	return {
		play: play,
		stop: stop
	};
};