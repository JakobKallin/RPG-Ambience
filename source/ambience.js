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
	
	function stopBackground(nextScene) {
		background.stopScene(nextScene);
	}
	
	function playForeground(scene) {
		foreground.playScene(scene);
	}
	
	function stopForeground(nextScene) {
		foreground.stopScene(nextScene);
	}
	
	function fadeOutForeground() {
		foreground.fadeOutScene();
	}
	
	function fadeOutBackground() {
		background.fadeOutScene();
	}
	
	function fadeOutTopmost() {
		if ( foreground.scene ) {
			fadeOutForeground();
		} else if ( background.scene ) {
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
				background.scene ||
				foreground.scene
			);
		}
	};
};