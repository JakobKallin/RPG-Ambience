Ambience = function(sceneStage, effectStage) {
	function play(scene) {
		if ( scene ) {
			if ( scene.isScene ) {
				playScene(scene);
			} else {
				playEffect(scene);
			}
		}
	}
	
	function playScene(scene) {
		stopScene(scene);
		sceneStage.playScene(scene);
	}
	
	function stopScene() {
		sceneStage.stopScene();
		stopEffect();
	}
	
	function playEffect(effect) {
		stopEffect();
		effectStage.playScene(effect);
	}
	
	function stopEffect() {
		effectStage.stopScene();
	}
	
	function togglePlayback() {
		if ( sceneIsPlaying() ) {
			sceneStage.togglePlayback();
			effectStage.togglePlayback();
		}
	}
	
	function sceneIsPlaying() {
		return Boolean(
			sceneStage.scene ||
			effectStage.scene
		);
	};
	
	function fadeOutEffect() {
		effectStage.fadeOutScene();
	}
	
	function fadeOutScene() {
		sceneStage.fadeOutScene();
	}
	
	return {
		play: play,
		playScene: playScene,
		stopScene: stopScene,
		playEffect: playEffect,
		stopEffect: stopEffect,
		fadeOutEffect: fadeOutEffect,
		fadeOutScene: fadeOutScene,
		togglePlayback: togglePlayback
	};
};