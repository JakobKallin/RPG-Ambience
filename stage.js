Ambience.Stage = function(node, speaker, sign, endsWithAudio) {
    var audiovisual = null;
    var soundIndex = null;
    var isFadingOut = false;
	
	var defaultBackground = document.body.style.backgroundColor;
	
	if ( endsWithAudio ) {
		var onAudioEnded = stopIfOnlyAudial;
	} else {
		var onAudioEnded = playNextSound;
	}
	speaker.addEventListener('ended', onAudioEnded);
    
    function stopAudiovisual() {
        $(node).stop(true, true); // Complete all animations, then stop them.
        node.style.display = 'none';
        node.style.backgroundColor = defaultBackground;
        node.style.backgroundImage = '';
        node.style.opacity = 0;
        
        if ( hasAudiovisual() && audiovisual.hasText ) {
            resetText();
        }
        
        stopSpeaker();
        
        audiovisual = null;
        soundIndex = null;
        isFadingOut = false;
    }
    
    function resetText() {
        sign.textContent = '';
        for ( var cssProperty in audiovisual.text ) {
			sign.style[cssProperty] = '';
        }
    }
    
    function playNextSound() {
		if ( hasAudiovisual() ) {
			if ( audiovisual.soundOrder === 'random' ) {
				soundIndex = audiovisual.soundPaths.randomIndex();
			} else {
				soundIndex = (soundIndex + 1) % audiovisual.soundPaths.length;
			}
			speaker.src = audiovisual.soundPaths[soundIndex];
			speaker.play();
		}
    }
    
    function stopSpeaker() {
        if ( !speaker.ended ) {
            try {
                speaker.currentTime = 0;
            } catch(e) {} // We do this because there is a small stutter at the start when playing the same file twice in a row.
            speaker.pause();
        }
        speaker.removeAttribute('src');
    }
    
    function fadeOutAudiovisual() {
        if ( isFadingOut ) {
            stopAudiovisual();
        } else {
            $(node).stop(true); // Stop all animations, because it might be fading in.
            $(node).animate({opacity: 0}, audiovisual.fadeDuration, stopAudiovisual);
            isFadingOut = true;
        }
    }
	
	function stopIfOnlyAudial() {
		if ( audiovisual !== null && !audiovisual.isVisual ) {
			stopAudiovisual();
		}
	}
	
	function hasAudiovisual() {
		return audiovisual !== null;
	}
    
    return {
        playAudiovisual: function(newAudiovisual) {
            audiovisual = newAudiovisual;
            
            if ( audiovisual.hasImage ) {
                node.style.backgroundImage = 'url(' + audiovisual.imagePath + ')';
            }
            
            // Locks up scene audio when effect both fades in and has audio for some reason.
            if ( audiovisual.isAudial ) {
                // -1 because the index is either incremented or randomized in the playNextSound method.
                soundIndex = -1;
                playNextSound();
            }
            
            if ( audiovisual.hasBackgroundColor ) {
                node.style.backgroundColor = audiovisual.backgroundColor;
            }
            
            if ( audiovisual.isVisual ) {
                node.style.display = 'table';
                $(node).animate({opacity: 1}, audiovisual.fadeDuration);
            }
            
            if ( audiovisual.hasText ) {
                sign.textContent = audiovisual.text;
                for ( var cssProperty in audiovisual.textStyle ) {
                    var cssValue = audiovisual.textStyle[cssProperty];
                    sign.style[cssProperty] = cssValue;
                }
            }
        },
        stopAudiovisual: stopAudiovisual,
        fadeOutAudiovisual: fadeOutAudiovisual,
        playNextSound: playNextSound,
        pause: function() {
			if ( hasAudiovisual() && audiovisual.isAudial ) {
				speaker.pause();
			}
        },
        resume: function() {
			if ( hasAudiovisual() && audiovisual.isAudial ) {
				speaker.play();
			}
        },
		get hasAudiovisual() {
			return hasAudiovisual();
		}
    };
};