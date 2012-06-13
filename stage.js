Ambience.Stage = function(node, speaker, sign) {
    var currentAudiovisual = null;
    var currentSoundIndex = null;
    var isFadingOut = false;
	
	var defaultBackground = $(document.body).css('background-color');
    
    function stopAudiovisual() {
        $(node).stop(true, true); // Complete all animations, then stop them.
        $(node).css('display', 'none');
        $(node).css('background-color', defaultBackground);
        $(node).css('background-image', '');
        $(node).css('opacity', 0);
        
        if ( currentAudiovisual && currentAudiovisual.hasText ) {
            resetText();
        }
        
        stopSpeaker();
        
        currentAudiovisual = null;
        currentSoundIndex = null;
        isFadingOut = false;
    }
    
    function resetText() {
        $(sign).text('');
        for ( var cssProperty in currentAudiovisual.text ) {
            if ( cssProperty !== 'text' ) {
                $(sign).css(cssProperty, '');
            }
        }
    }
    
    function playNextSound() {
        if ( currentAudiovisual.soundOrder === 'random' ) {
            currentSoundIndex = currentAudiovisual.soundPaths.randomIndex();
        } else {
            currentSoundIndex = (currentSoundIndex + 1) % currentAudiovisual.soundPaths.length;
        }
        speaker.src = currentAudiovisual.soundPaths[currentSoundIndex];
        speaker.play();
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
            $(node).animate({opacity: 0}, currentAudiovisual.fadeDuration, stopAudiovisual);
            isFadingOut = true;
        }
    }
    
    return {
        isPlaying: function() {
            return currentAudiovisual !== null;
        },
        playAudiovisual: function(audiovisual) {
            currentAudiovisual = audiovisual;
            
            if ( audiovisual.hasImage ) {
                $(node).css('background-image', 'url(' + audiovisual.imagePath + ')');
            }
            
            // Locks up scene audio when effect both fades in and has audio for some reason.
            if ( audiovisual.isAudial ) {
                // -1 because the index is either incremented or randomized in the playNextSound method.
                currentSoundIndex = -1;
                playNextSound();
            }
            
            if ( audiovisual.hasBackgroundColor ) {
                $(node).css('background-color', audiovisual.backgroundColor);
            }
            
            if ( audiovisual.isVisual ) {
                $(node).css('display', 'table');
                $(node).animate({opacity: 1}, audiovisual.fadeDuration);
            }
            
            if ( audiovisual.hasText ) {
                $(sign).text(audiovisual.text);
                for ( var cssProperty in audiovisual.textStyle ) {
                    var cssValue = audiovisual.textStyle[cssProperty];
                    $(sign).css(cssProperty, cssValue);
                }
            }
        },
        stopAudiovisual: stopAudiovisual,
        fadeOutAudiovisual: fadeOutAudiovisual,
        playNextSound: playNextSound,
        pause: function() {
            speaker.pause();
        },
        resume: function() {
            speaker.play();
        }
    };
};