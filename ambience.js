Ambience = function(sceneStage, effectStage) {
	function play(audiovisual) {
		if ( audiovisual.isScene ) {
			playScene(audiovisual);
		} else {
			playEffect(audiovisual);
		}
	}
	
	function playScene(scene) {
		stopScene(scene);
		sceneStage.playAudiovisual(scene);
	}
	
	function stopScene() {
		sceneStage.stopAudiovisual();
		stopEffect();
	}
	
	function playEffect(effect) {
		stopEffect();
		effectStage.playAudiovisual(effect);
	}
	
	function stopEffect() {
		effectStage.stopAudiovisual();
	}
	
	function togglePlayback() {
		if ( hasAudiovisual() ) {
			sceneStage.togglePlayback();
			effectStage.togglePlayback();
		}
	}
	
	function hasAudiovisual() {
		return (
			sceneStage.hasAudiovisual ||
			effectStage.hasAudiovisual
		);
	};
	
	function fadeOutEffect() {
		effectStage.fadeOutAudiovisual();
	}
	
	function fadeOutScene() {
		sceneStage.fadeOutAudiovisual();
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