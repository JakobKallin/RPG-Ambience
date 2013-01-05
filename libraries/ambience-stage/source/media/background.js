// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Background = function(node) {
	function play(scene) {
		if ( scene.background ) {
			node.style.background = scene.background.color;
		}
	}
	
	function stop() {
		node.style.background = Ambience.Scene.Background.prototype.color;
	}
	
	return {
		play: play,
		stop: stop
	};
};