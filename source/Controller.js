// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.Controller = function(background, foreground) {
	function playBackground(scene) {
		if ( scene ) {
			background.play(scene);
		}
	}

	function playForeground(scene) {
		if ( scene ) {
			foreground.play(scene);
		}
	}
	
	function stopBackground() {
		background.stop();
	}

	function stopForeground() {
		foreground.stop();
	}
	
	function fadeOutForeground() {
		foreground.fadeOut();
	}
	
	function fadeOutBackground() {
		background.fadeOut();
	}
	
	function fadeOutTopmost() {
		if ( foreground.sceneIsPlaying ) {
			fadeOutForeground();
		} else if ( background.sceneIsPlaying ) {
			fadeOutBackground();
		}
	}
	
	return {
		playForeground: playForeground,
		playBackground: playBackground,
		stopBackground: stopBackground,
		stopForeground: stopForeground,
		fadeOutForeground: fadeOutForeground,
		fadeOutBackground: fadeOutBackground,
		fadeOutTopmost: fadeOutTopmost,
		get sceneIsPlaying() {
				return Boolean(
				background.sceneIsPlaying ||
				foreground.sceneIsPlaying
			);
		}
	};
};