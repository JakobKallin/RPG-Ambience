var AdventureLibrary = function(app) {
	this.load = function() {
		var state = JSON.parse(localStorage.getItem('adventure'));
		if ( state ) {
			var adventure = new AdventureViewModel(app);
			
			state.scenes.forEach(function(sceneState) {
				var scene = adventure.newScene();
				Object.overlay(scene, sceneState);
				adventure.scenes.push(scene);
				
				if ( scene.image.id ) {
					app.media.load(scene.image.id, function(url) {
						scene.image.path = url;
					});
				}
				
				scene.sound.tracks.forEach(function(track) {
					if ( track.id ) {
						app.media.load(track.id, function(url) {
							track.path = url;
						});
					}
				});
			});
			
			if ( adventure.scenes.length > 0 ) {
				adventure.select(adventure.scenes[0]);
			}
			
			return adventure;
		} else {
			return null;
		}
	};
	
	this.save = function(adventure) {
		var state = {
			scenes: adventure.scenes.map(function(scene) {
				return scene.copyState();
			})
		};
		
		// Keep temporary object URLs from being saved.
		state.scenes.forEach(function(scene) {
			if ( scene.image.id ) {
				scene.image.path = '';
			}
			
			scene.sound.tracks.forEach(function(track) {
				if ( track.id ) {
					track.path = '';
				}
			});
		});
		
		localStorage.setItem('adventure', JSON.stringify(state));
	};
	
	this.loadExample = function() {
		var adventure = new AdventureViewModel(app);
		adventure.title = 'Example adventure';
		
		var music = adventure.add();
		music.name = 'Music';
		music.key = 'M';
		music.sound.tracks.push({
			name: '9-Trailer_Music.ogg',
			path: 'example/9-Trailer_Music.ogg'
		});
		music.sound.loop = false;
		
		var imagine = adventure.add();
		imagine.name = 'Imagine';
		imagine.key = '1';
		imagine.layer = 'foreground';
		imagine.fade = 1.6;
		imagine.text.string = 'Don’t just imagine your world';
		imagine.text.size = 4.5;
		imagine.text.font = 'Palatino Linotype, Georgia, serif';
		imagine.text.italic = true;
		
		var life = adventure.add();
		life.name = 'Life';
		life.key = '2';
		life.layer = 'foreground';
		life.text.string = 'Bring it to life';
		life.text.size = 9;
		life.text.font = 'Palatino Linotype, Georgia, serif';
		life.text.italic = true;
		life.fade = 1.6;
		life.fadeDirection = 'out';
		
		var city = adventure.add();
		city.name = 'City';
		city.key = 'C';
		city.layer = 'foreground';
		city.image.name = 'ishtar_rooftop.jpg';
		city.image.path = 'example/ishtar_rooftop.jpg';
		city.image.size = 'cover';
		city.fade = 4;
		
		var dragon = adventure.add();
		dragon.name = 'Dragon';
		dragon.key = 'D';
		dragon.layer = 'foreground';
		dragon.image.name = 'sintel-wallpaper-dragon.jpg';
		dragon.image.path = 'example/sintel-wallpaper-dragon.jpg';
		dragon.image.size = 'cover';
		dragon.sound.tracks.push({
			name: 'dragon.ogg',
			path: 'example/dragon.ogg'
		});
		dragon.sound.loop = false;
		dragon.fade = 3.2;
		dragon.fadeDirection = 'out';
		
		var title = adventure.add();
		title.name = 'Ambience';
		title.key = 'A';
		title.layer = 'foreground';
		title.text.string = 'RPG Ambience';
		title.text.size = 9;
		title.text.font = 'Constantia, Georgia, serif';
		title.fade = 3.2;
		
		return adventure;
	};
};