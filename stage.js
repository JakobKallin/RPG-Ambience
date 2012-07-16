Ambience.Stage = function(node, imageNode, speaker, sign, videoNode) {
	var audiovisual;
	var videoIndex;
	
	var isPaused;
	var videoHasEnded;
	var isFadingIn;
	var isFadingOut;
	
	var fadeAnimation = new Animation(node.style, 'opacity');
	
	var defaultBackground = document.body.style.backgroundColor;
	
	var image = new Ambience.Image(imageNode);
	var sound = new Ambience.Sound(speaker);
	var text = new Ambience.Text(sign);
	var imageDelayTimer;
	
	videoNode.addEventListener('ended', playNextVideo);
	
	reset();
	
	function reset() {
		node.style.visibility = 'hidden';
		node.style.backgroundColor = defaultBackground;
		node.style.opacity = 0;
		
		image.reset(audiovisual);
		text.reset();
		sound.reset();
		stopVideo();
		stopFadeIn();
		
		audiovisual = null;
		videoIndex = null;
		
		window.clearTimeout(imageDelayTimer);
		
		isPaused = false;
		videoHasEnded = false;
		isFadingIn = false;
		isFadingOut = false;
	}
	
	function playAudiovisual(newAudiovisual) {
		audiovisual = newAudiovisual;
		playFadeIn();
		imageDelayTimer = window.setTimeout(playImage, audiovisual.imageDelay);
		playBackgroundColor();
		sound.play(audiovisual);
		text.play(audiovisual);
		playVideo();
	}
	
	function playImage() {
		image.play(audiovisual);
	}
	
	function playBackgroundColor() {
		if ( audiovisual.hasBackgroundColor ) {
			node.style.backgroundColor = audiovisual.backgroundColor;
		}
	}
	
	function playFadeIn() {
		if ( audiovisual.isVisual ) {
			node.style.visibility = 'visible';
		}
		
		isFadingIn = true
		fadeAnimation.start(1, audiovisual.fadeInDuration, {ended: onFadeInEnded});		
	}
	
	function playVideo() {
		if ( audiovisual.hasVideo ) {
			videoNode.style.visibility = 'visible';
			videoIndex = -1;
			playNextVideo();
		}
	}
	
	function onFadeInEnded() {
		isFadingIn = false;
	}
	
	function playNextVideo() {
		if ( audiovisual ) {
			// We need this so that we stop audio-only effects after they have actually played once.
			var videoHasPlayedBefore = videoIndex !== -1;
			
			if ( audiovisual.videoOrder === 'random' ) {
				videoIndex = audiovisual.videoPaths.randomIndex();
			} else {
				videoIndex = (videoIndex + 1) % audiovisual.videoPaths.length;
			}
			
			var allVideosHavePlayed = videoHasPlayedBefore && videoIndex === 0;
			if ( allVideosHavePlayed && !audiovisual.loops ) {
				videoHasEnded = true;
			} else {
				videoNode.src = audiovisual.videoPaths[videoIndex];
				videoNode.play();
			}
		}
	}
	
	function stopVideo() {
		if ( !videoNode.ended ) {
			try {
				videoNode.currentTime = 0;
			} catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
			videoNode.pause();
		}
		videoNode.removeAttribute('src');
		videoNode.style.visibility = 'hidden';
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
			if ( audiovisual.hasVideo && !videoHasEnded ) {
				videoNode.pause();
			}
			if ( isFadingIn || isFadingOut ) {
				fadeAnimation.pause();
			}
			isPaused = true;
		}
	}
	
	function resume() {
		if ( audiovisual && isPaused ) {
			sound.resume();
			if ( audiovisual.hasVideo && !videoHasEnded ) {
				videoNode.play();
			}
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
		playAudiovisual: playAudiovisual,
		stopAudiovisual: reset,
		fadeOutAudiovisual: fadeOutAudiovisual,
		togglePlayback: togglePlayback,
		get audiovisual() {
			return audiovisual;
		}
	};
};