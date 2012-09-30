Ambience.Layer = function(node) {
	var isFadingIn;
	var isFadingOut;
	var fadeOutDuration;
	var fade;
	var stopTimer;
	
	var mediaPlayers = {
		'backgroundColor': new Ambience.Background(node),
		'image': new Ambience.Image(node),
		'sounds': new Ambience.SoundList(node, stopSceneIfSoundOnly),
		'text': new Ambience.Text(node)
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
	
	function stopSceneIfSoundOnly() {
		// The 2 below is because there might be a background color as well.
		if ( playingMedia.contains('sounds') && playingMedia.length <= 2 ) {
			stopScene();
		}
	}
	
	function playScene(scene) {
		var alreadyPlaying = playingMedia.length > 0;
		if ( alreadyPlaying && scene.isMixin ) {
			playMixin(scene);
		} else {
			playRegularScene(scene);
		}
	}
	
	function playRegularScene(scene) {
		stopScene();
		
		fadeOutDuration = scene.fadeOutDuration;
		playFadeIn(scene);
		
		for ( var mediaType in mediaPlayers ) {
			if ( scene[mediaType] ) {
				mediaPlayers[mediaType].play(scene, fade);
				playingMedia.push(mediaType);
			}
		}
	}
	
	function playMixin(mixin) {
		if ( mixin.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		for ( var mediaType in mediaPlayers ) {
			if ( playingMedia.contains(mediaType) && mixin[mediaType] ) {
				mediaPlayers[mediaType].stop();
				playingMedia.remove(mediaType);
			}
		}
		
		for ( var mediaType in mediaPlayers ) {
			if ( mixin[mediaType] ) {
				mediaPlayers[mediaType].play(mixin, fade);
				playingMedia.push(mediaType);
			}
		}
	}
	
	function playFadeIn(scene) {
		if ( scene.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		isFadingIn = true;
		fade.play(scene.fadeInDuration, {onEnded: onFadeInEnded});		
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopFade() {
		isFadingIn = false;
		isFadingOut = false;
		
		if ( fade ) {
			fade.stop();
		}
		
		fade = new Manymation();
		fade.track(node.style, 'opacity', 1);
		fade.onRewindEnded(stopScene);
		
		window.clearTimeout(stopTimer);
		stopTimer = null;
	}
	
	function fadeOutScene() {
		if ( isFadingOut ) {
			stopScene();
		} else {
			isFadingOut = true;
			
			fade.rewind(fadeOutDuration);
			
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