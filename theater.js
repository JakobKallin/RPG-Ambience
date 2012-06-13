Ambience.Theater = function(sceneStage, effectStage) {
	var paused = false;
	
	function playScene(scene) {
		this.stopScene(scene);
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
	
	function pause() {
		if ( sceneStage.isPlaying() ) {
			sceneStage.pause()
		}
		
		if ( effectStage.isPlaying() ) {
			effectStage.pause();
		}
	}
	
	function resume() {
		if ( sceneStage.isPlaying() ) {
			sceneStage.resume();
		}
		
		if ( effectStage.isPlaying() ) {
			effectStage.resume();
		}
	}
	
	function togglePlayback() {
		if ( this.isPlaying ) {
			sceneStage.pause();
			effectStage.pause();
		} else {
			sceneStage.resume();
			effectStage.resume();
		}
	}
	
	this.__defineGetter__('isPlaying', function() {
		return !paused;
	});
	
	function fadeOutEffect() {
		effectStage.fadeOutAudiovisual();
	}
	
	function fadeOutScene() {
		sceneStage.fadeOutAudiovisual();
	}
	
	return {
		playScene: playScene,
		stopScene: stopScene,
		playEffect: playEffect,
		stopEffect: stopEffect,
		fadeOutEffect: fadeOutEffect,
		fadeOutScene: fadeOutScene,
		togglePlayback: togglePlayback
	};
};