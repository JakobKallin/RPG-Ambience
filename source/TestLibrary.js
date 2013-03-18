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
					url: null,
					name: null,
					id: null,
					size: 'cover'
				},
				sound: {
					tracks: [],
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
	onLoad({
		name: 'image.png',
		url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY2D4zwAAAgIBANHTRkQAAAAASUVORK5CYII=',
		id: 1,
		mimeType: 'image/png'
	});
};

Ambience.App.TestLibrary.prototype.selectTrack = function(onLoad) {
	// 0.001 seconds of silence.
	onLoad({
		name: 'track.wav',
		url: 'data:audio/wav;base64,NTI0OTQ2NDY3YzAwMDAwMDU3NDE1NjQ1NjY2ZDc0MjAxMDAwMDAwMDAxMDAwMTAwNDRhYzAwMDA4ODU4MDEwMDAyMDAxMDAwNjQ2MTc0NjE1ODAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDBmZmZmMDIwMGZlZmYwMjAwZmVmZjAyMDBmZWZmMDIwMGZmZmZmZmZmMDIwMGZlZmYwMzAwZmRmZjAxMDAwMDAwZmZmZjAzMDBmY2ZmMDQwMGZjZmYwNDAwZmRmZjAyMDBmZmZmMDEwMGZmZmYwMTAwZmZmZjAxMDBmZmZmMDEwMGZmZmYwMTAw',
		id: 2,
		mimeType: 'audio/wav'
	});
};

['loadAdventures', 'selectImage', 'selectTrack'].forEach(function(name) {
	var original = Ambience.App.TestLibrary.prototype[name];
	Ambience.App.TestLibrary.prototype[name] = function() {
		var originalThis = this;
		var originalArguments = arguments;
		window.setTimeout(function() {
			original.apply(this, originalArguments);
		}, 1000);
	};
});