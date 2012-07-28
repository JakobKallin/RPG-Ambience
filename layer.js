Ambience.Stage = function(node) {
	var scene;
	
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	var stopTimer;
	
	var parts = {
		'backgroundColor': new Ambience.Background(node),
		'image': new Ambience.Image(node),
		'sounds': new Ambience.SoundList(node, stopScene),
		'text': new Ambience.Text(node),
		'video': new Ambience.Video(node)
	};
	
	stopScene();
	
	function stopScene() {
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		
		for ( var part in parts ) {
			if ( scene && scene[part] ) {
				parts[part].stop();
			}
		}
		
		stopFadeIn();
		isFadingIn = false;
		isFadingOut = false;
		
		window.clearTimeout(stopTimer);
		stopTimer = null;
		
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
		fadeAnimation.start(1, scene.fadeInDuration, {onEnded: onFadeInEnded});		
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
				stopScene();
			} else {
				isFadingOut = true;
				
				if ( scene.sounds ) { parts.sounds.fadeOut(); }
				if ( scene.video ) { parts.video.fadeOut(); }
				
				// The current opacity compared to 1, if the scene has been halfway faded in.
				var opacityPercentage = node.style.opacity / 1;
				var fadeDuration = scene.fadeOutDuration * opacityPercentage;
				fadeAnimation.start(0, fadeDuration);
				
				stopTimer = window.setTimeout(stopScene, fadeDuration);
			}
		}
	}
	
	return {
		playScene: playScene,
		stopScene: stopScene,
		fadeOutScene: fadeOutScene,
		get scene() {
			return scene;
		}
	};
};