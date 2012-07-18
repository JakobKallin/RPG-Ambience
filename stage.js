Ambience.Stage = function(node, imageNode, speaker, sign, videoNode) {
	var scene;
	
	var isPaused;
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	
	var image = new Ambience.Image(imageNode);
	var sound = new Ambience.Sound(speaker, reset);
	var text = new Ambience.Text(sign);
	var background = new Ambience.Background(node);
	var video = new Ambience.Video(videoNode, reset);
	
	reset();
	
	function reset() {
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		
		background.reset();
		image.reset();
		text.reset();
		sound.reset();
		video.reset();
		stopFadeIn();
		
		scene = null;
		
		isPaused = false;
		isFadingIn = false;
		isFadingOut = false;
	}
	
	function playScene(newScene) {
		scene = newScene;
		playFadeIn();
		image.play(scene);
		background.play(scene);
		sound.play(scene);
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
			// This should work even if the stage is currently paused, so we have to unpause it to prevent incorrect state.
			if ( isPaused ) {
				isPaused = false;
			}
			
			if ( isFadingOut ) {
				reset();
			} else {
				isFadingOut = true;
				
				sound.fadeOut();
				
				// The current opacity compared to 1, if the scene has been halfway faded in.
				var opacityPercentage = node.style.opacity / 1;
				var fadeDuration = scene.fadeOutDuration * opacityPercentage;
				fadeAnimation.start(0, fadeDuration, {completed: reset});
			}
		}
	}
	
	function pause() {
		if ( scene && !isPaused ) {
			sound.pause();
			video.pause();
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.pause();
			}
			isPaused = true;
		}
	}
	
	function resume() {
		if ( scene && isPaused ) {
			sound.resume();
			video.resume();
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.resume();
			}
			isPaused = false;
		}
	}
	
	function togglePlayback() {
		if ( isPaused ) {
			resume();
		} else {
			pause();
		}
	}
	
	return {
		playScene: playScene,
		stopScene: reset,
		fadeOutScene: fadeOutScene,
		togglePlayback: togglePlayback,
		get scene() {
			return scene;
		}
	};
};