window.RpgAmbience = window.RpgAmbience || {};
window.RpgAmbience.Adventure = window.RpgAmbience.Adventure || {};

RpgAmbience.Adventure.upgrade = function(adventure) {
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
};
