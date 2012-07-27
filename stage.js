Ambience.Stage = function(node) {
	var scene;
	
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	
	var image = new Ambience.Image(node);
	var soundList = new Ambience.SoundList(stop);
	var text = new Ambience.Text(node);
	var background = new Ambience.Background(node);
	var video = new Ambience.Video(node);
	
	stop();
	
	function stop() {
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		
		background.stop();
		if (scene) { image.stop(); }
		if (scene) { text.stop(); }
		soundList.stop();
		if (scene) { video.abort(); }
		stopFadeIn();
		
		scene = null;
		
		isFadingIn = false;
		isFadingOut = false;
	}
	
	function playScene(newScene) {
		scene = newScene;
		playFadeIn();
		image.play(scene);
		background.play(scene);
		soundList.play(scene);
		text.play(scene);
		video.play(scene);
	}
	
	function playFadeIn() {
		if ( scene.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		isFadingIn = true
		fadeAnimation.start(1, scene.fadeInDuration, {ended: onFadeInEnded});		
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopFadeIn() {
		fadeAnimation.stop();
	}
	
	function fadeOutScene() {
		if ( scene ) {
			if ( isFadingOut ) {
				stop();
			} else {
				isFadingOut = true;
				
				soundList.stop();
				video.stop();
				
				// The current opacity compared to 1, if the scene has been halfway faded in.
				var opacityPercentage = node.style.opacity / 1;
				var fadeDuration = scene.fadeOutDuration * opacityPercentage;
				fadeAnimation.start(0, fadeDuration, {completed: stop});
			}
		}
	}
	
	return {
		playScene: playScene,
		stopScene: stop,
		fadeOutScene: fadeOutScene,
		get scene() {
			return scene;
		}
	};
};