Ambience.App.Library.Test = function() {};

Ambience.App.Library.Test.prototype.loadAdventures = function(onLoad) {
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

['loadAdventures'].forEach(function(name) {
	var original = Ambience.App.Library.Test.prototype[name];
	Ambience.App.Library.Test.prototype[name] = function() {
		var originalThis = this;
		var originalArguments = arguments;
		window.setTimeout(function() {
			original.apply(this, originalArguments);
		}, 2000);
	};
});