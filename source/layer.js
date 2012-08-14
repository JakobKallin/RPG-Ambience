Ambience.Layer = function(node) {
	var isFadingIn;
	var isFadingOut;
	var fadeOutDuration;
	var fadeAnimation = new Animation(node.style, 'opacity');
	var stopTimer;
	
	var mediaPlayers = {
		'backgroundColor': new Ambience.Background(node),
		'image': new Ambience.Image(node),
		'sounds': new Ambience.SoundList(node, stopScene),
		'text': new Ambience.Text(node),
		'video': new Ambience.Video(node)
	};
	
	var playingMedia = [];
	
	stopScene();
	
	function stopScene() {
		for ( var mediaType in mediaPlayers ) {
			if ( playingMedia.contains(mediaType) ) {
				mediaPlayers[mediaType].stop();
				playingMedia.remove(mediaType);
			}
		}
		
		stopFade();
		
		node.style.visibility = 'hidden';
		node.style.opacity = 0;
		fadeOutDuration = 0;
	}
	
	function stopRedefinedMedia(newScene) {
		for ( var mediaType in mediaPlayers ) {
			if ( playingMedia.contains(mediaType) && newScene[mediaType] ) {
				mediaPlayers[mediaType].stop();
				playingMedia.remove(mediaType);
			}
		}
	}
	
	function playScene(newScene) {
		var alreadyPlaying = playingMedia.length > 0;
		if ( alreadyPlaying && newScene.isMixin ) {
			stopRedefinedMedia(newScene);
		} else if ( alreadyPlaying && !newScene.isMixin ) {
			stopScene();
		}
		
		fadeOutDuration = newScene.fadeOutDuration;
		playFadeIn(newScene);
		
		for ( var mediaType in mediaPlayers ) {
			if ( newScene[mediaType] ) {
				mediaPlayers[mediaType].play(newScene);
				playingMedia.push(mediaType);
			}
		}
	}
	
	function playFadeIn(newScene) {
		if ( newScene.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		isFadingIn = true;
		fadeAnimation.start(1, newScene.fadeInDuration, {onEnded: onFadeInEnded});		
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopFade() {
		fadeAnimation.stop();
		isFadingIn = false;
		isFadingOut = false;
		
		window.clearTimeout(stopTimer);
		stopTimer = null;
	}
	
	function fadeOutScene() {
		if ( isFadingOut ) {
			stopScene();
		} else {
			isFadingOut = true;
			
			// Take the current opacity into account, if the scene has been halfway faded in.
			var fadeDuration = fadeOutDuration * node.style.opacity;
			fadeAnimation.start(0, fadeDuration);
			
			// Make sure the scene stops entirely after fading out.
			stopTimer = window.setTimeout(stopScene, fadeDuration);
			
			for ( var mediaType in mediaPlayers ) {
				if ( playingMedia.contains(mediaType) && 'fadeOut' in mediaPlayers[mediaType] ) {
					mediaPlayers[mediaType].fadeOut();
				}
			}
		}
	}
	
	return {
		playScene: playScene,
		stopScene: stopScene,
		fadeOutScene: fadeOutScene,
		get isPlaying() {
			return playingMedia.length > 0;
		}
	};
};