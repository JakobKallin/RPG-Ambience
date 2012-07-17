Ambience.Stage = function(node, imageNode, speaker, sign, videoNode) {
	// The media elements need a reference to the stage so that they can stop the entire audiovisual when a media-only audiovisual has finished.
	var self = {};
	
	var audiovisual;
	
	var isPaused;
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	
	var image = new Ambience.Image(imageNode);
	var sound = new Ambience.Sound(speaker, self);
	var text = new Ambience.Text(sign);
	var background = new Ambience.Background(node);
	var video = new Ambience.Video(videoNode, self);
	
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
		
		audiovisual = null;
		
		isPaused = false;
		isFadingIn = false;
		isFadingOut = false;
	}
	
	function playAudiovisual(newAudiovisual) {
		audiovisual = newAudiovisual;
		playFadeIn();
		image.play(audiovisual);
		background.play(audiovisual);
		sound.play(audiovisual);
		text.play(audiovisual);
		video.play(audiovisual);
	}
	
	function playFadeIn() {
		if ( audiovisual.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		isFadingIn = true
		fadeAnimation.start(1, audiovisual.fadeInDuration, {ended: onFadeInEnded});		
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function stopFadeIn() {
		fadeAnimation.stop();
	}
	
	function fadeOutAudiovisual() {
		if ( audiovisual ) {
			// This should work even if the stage is currently paused, so we have to unpause it to prevent incorrect state.
			if ( isPaused ) {
				isPaused = false;
			}
			
			if ( isFadingOut ) {
				reset();
			} else {
				isFadingOut = true;
				
				sound.fadeOut();
				
				// The current opacity compared to 1, if the audiovisual has been halfway faded in.
				var opacityPercentage = node.style.opacity / 1;
				var fadeDuration = audiovisual.fadeOutDuration * opacityPercentage;
				fadeAnimation.start(0, fadeDuration, {completed: reset});
			}
		}
	}
	
	function pause() {
		if ( audiovisual && !isPaused ) {
			sound.pause();
			video.pause();
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.pause();
			}
			isPaused = true;
		}
	}
	
	function resume() {
		if ( audiovisual && isPaused ) {
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
	
	self.playAudiovisual = playAudiovisual;
	self.stopAudiovisual = reset;
	self.fadeOutAudiovisual = fadeOutAudiovisual;
	self.togglePlayback = togglePlayback;
	self.__defineGetter__('audiovisual', function() {
		return audiovisual;
	});
	
	return self;
};