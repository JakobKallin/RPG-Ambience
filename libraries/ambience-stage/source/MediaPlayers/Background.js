// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

AmbienceStage.Background = function(node) {
	function play(scene) {
		if ( scene.background ) {
			node.style.setProperty('background', scene.background.color);
		}
	}
	
	function stop() {
		node.style.removeProperty('background');
	}
	
	return {
		play: play,
		stop: stop
	};
};