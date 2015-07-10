window.RpgAmbience = window.RpgAmbience || {};
window.RpgAmbience.Adventure = window.RpgAmbience.Adventure || {};

RpgAmbience.Adventure.upgrade = function(adventure) {
    upgradeOlderVersions(adventure);
    
    if ( adventure.version !== 4 ) {
        throw new Error('Upgrade only supported from version 4 to 5.');
    }
    
    adventure.scenes.forEach(upgradeScene);
    adventure.version = 5;
    
    return adventure;
    
    function upgradeScene(scene) {
        if ( !scene.key ) {
            scene.key = null;
        }
        
        delete scene.mixin;
        scene.fade.in = scene.fade.direction.indexOf('in') !== -1;
        scene.fade.out = scene.fade.direction.indexOf('out') !== -1;
        delete scene.fade.direction;
        
        scene.background = scene.background.color;
        
        scene.media = [];
        
        if ( scene.image.file ) {
            scene.media.push({
                type: 'image',
                file: scene.image.file.id,
                size: scene.image.size
            });
        }
        delete scene.image;
        
        if ( scene.text.string.length > 0 ) {
            scene.media.push({
                type: 'text',
                string: scene.text.string,
                size: scene.text.size,
                font: scene.text.font ? scene.text.font : null,
                color: scene.text.color,
                bold: scene.text.bold,
                italic: scene.text.italic,
                alignment: scene.text.alignment,
                padding: scene.text.padding
            });
        }
        delete scene.text;
        
        if ( scene.sound.tracks.length > 0 ) {
            scene.media.push({
                type: 'sound',
                tracks: scene.sound.tracks.map((t) => t.id),
                loop: scene.sound.loop,
                shuffle: scene.sound.shuffle,
                volume: scene.sound.volume / 100,
                overlap: scene.sound.overlap
            });
        }
        delete scene.sound;
        
        return scene;
    }
    
    // The code below (including comments) is taken straight from the previous
    // version of RPG Ambience, which also includes tests for it. To keep things
    // simple, the tests are not included in this version.
    function upgradeOlderVersions(config) {
        if ( config.version === 2 ) {
            // Adventures of version 2 only contain IDs of media files, not
            // names and MIME types. Add these here so that they are properly
            // queued when downloaded.
            config.scenes.forEach(function(scene) {
                var imageFile = scene.image.file;
                if ( imageFile ) {
                    imageFile.name = 'Unknown filename';
                    imageFile.mimeType = 'image/unknown';
                }
                
                scene.sound.tracks.forEach(function(soundFile) {
                    soundFile.name = 'Unknown filename';
                    soundFile.mimeType = 'audio/unknown';
                });
            });
            
            config.version = 3;
        }
        
        if ( config.version === 3 ) {
            delete config.creationDate;
            delete config.modificationDate;
            
            config.version = 4;
        }
    }
};
