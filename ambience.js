Ambience = function(sceneStage, effectStage) {
	var paused = false;
	
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
		paused = false;
		stopEffect();
	}
	
	function playEffect(effect) {
		stopEffect();
		effectStage.playAudiovisual(effect);
	}
	
	function stopEffect() {
		effectStage.stopAudiovisual();
		paused = false;
	}
	
	function togglePlayback() {
		if ( !hasAudiovisual() ) {
			return;
		}
		
		if ( isPlaying() ) {
			sceneStage.pause();
			effectStage.pause();
			paused = true;
		} else {
			sceneStage.resume();
			effectStage.resume();
			paused = false;
		}
	}
	
	function isPlaying() {
		return !paused;
	};
	
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