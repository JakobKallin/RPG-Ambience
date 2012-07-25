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
		stopBackground(scene);
		background.playScene(scene);
	}
	
	function stopBackground() {
		background.stopScene();
		stopForeground();
	}
	
	function playForeground(scene) {
		stopForeground();
		foreground.playScene(scene);
	}
	
	function stopForeground() {
		foreground.stopScene();
	}
	
	function sceneIsPlaying() {
		return Boolean(
			background.scene ||
			foreground.scene
		);
	};
	
	function fadeOutForeground() {
		foreground.fadeOutScene();
	}
	
	function fadeOutBackground() {
		background.fadeOutScene();
	}
	
	return {
		play: play,
		playBackground: playBackground,
		stopBackground: stopBackground,
		playForeground: playForeground,
		stopForeground: stopForeground,
		fadeOutForeground: fadeOutForeground,
		fadeOutBackground: fadeOutBackground
	};
};