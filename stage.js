Ambience.Stage = function(node) {
	var scene;
	
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	
	var parts = {
		'background': new Ambience.Background(node),
		'image': new Ambience.Image(node),
		'sounds': new Ambience.SoundList(stop),
		'text': new Ambience.Text(node),
		'video': new Ambience.Video(node)
	};
	
	stop();
	
	function stop() {
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		
		for ( var part in parts ) {
			if ( scene && scene[part] ) {
				parts[part].stop();
			}
		}
		/*
		background.stop();
		if (scene) { image.stop(); }
		if (scene) { text.stop(); }
		soundList.stop();
		if (scene) { video.abort(); }
		*/
		stopFadeIn();
		isFadingIn = false;
		isFadingOut = false;
		
		scene = null;
	}
	
	function playScene(newScene) {
		scene = newScene;
		
		playFadeIn();
		
		for ( var part in parts ) {
			if ( scene && scene[part] ) {
				parts[part].play(scene);
			}
		}
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
				
				if ( scene.sounds ) { parts.sounds.stop(); }
				if ( scene.video ) { parts.video.stop(); }
				
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