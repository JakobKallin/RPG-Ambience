Ambience.App.TestLibrary = function() {};

Ambience.App.TestLibrary.prototype.loadAdventures = function(onLoad) {
	var config = {
		title: 'Test adventure',
		version: 2,
		scenes: [
			{
				name: 'Test scene',
				key: 'T',
				layer: 'foreground',
				mixin: true,
				background: {
					colo: '#abcdef'
				},
				fade: {
					in: '1',
					out: '1'
				},
				image: {
					url: '',
					name: 'Test.jpg',
					id: 'Test ID',
					size: 'cover'
				},
				sound: {
					tracks: [
						{
							name: 'Test.mp3',
							url: '',
							id: 'Test ID',
						}
					],
					loop: true,
					shuffle: true,
					volume: '50',
					crossover: '1'
				},
				text: {
					string: 'Test string',
					size: '5',
					font: 'Test font',
					color: '#abcdef',
					bold: true,
					italic: true,
					alignment: 'center',
					padding: '10'
				}
			}
		]
	};
	
	onLoad(Ambience.App.Adventure.fromConfig(config));
};

Ambience.App.TestLibrary.prototype.selectImage = function(onLoad) {
	// Single green pixel.
	onLoad('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII=');
};

['loadAdventures', 'selectImage'].forEach(function(name) {
	var original = Ambience.App.TestLibrary.prototype[name];
	Ambience.App.TestLibrary.prototype[name] = function() {
		var originalThis = this;
		var originalArguments = arguments;
		window.setTimeout(function() {
			original.apply(this, originalArguments);
		}, 2000);
	};
});