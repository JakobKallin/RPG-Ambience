Ambience = function(background, foreground) {
	function play(scene) {
		if ( scene ) {
			if ( scene.layer === 'background' ) {
				playBackground(scene);
			} else {
				playForeground(scene);
			}
		}
	}
	
	function playBackground(scene) {
		background.playScene(scene);
	}
	
	function stopBackground() {
		background.stopScene();
	}
	
	function playForeground(scene) {
		foreground.playScene(scene);
	}
	
	function stopForeground() {
		foreground.stopScene();
	}
	
	function fadeOutForeground() {
		foreground.fadeOutScene();
	}
	
	function fadeOutBackground() {
		background.fadeOutScene();
	}
	
	function fadeOutTopmost() {
		if ( foreground.isPlaying ) {
			fadeOutForeground();
		} else if ( background.isPlaying ) {
			fadeOutBackground();
		}
	}
	
	return {
		play: play,
		stopBackground: stopBackground,
		stopForeground: stopForeground,
		fadeOutForeground: fadeOutForeground,
		fadeOutBackground: fadeOutBackground,
		fadeOutTopmost: fadeOutTopmost,
		get sceneIsPlaying() {
				return Boolean(
				background.isPlaying ||
				foreground.isPlaying
			);
		}
	};
};