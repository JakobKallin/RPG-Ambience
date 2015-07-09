suite('RPG Ambience', () => {
	const assert = chai.assert;
	const assertEqual = chai.assert.deepEqual;
	const assertError = chai.assert.throws;
	chai.config.truncateThreshold = 0;
	
	const RpgAmbience = window.RpgAmbience;
	
	suite('adventure', () => {
		suite('upgrade', () => {
			suite('4 to 5', () => {
				const upgrade = RpgAmbience.Adventure.upgrade;
				
				// Writing tests for individual features is difficult because 
				// adventures must contain unrelated properties that make it 
				// unclear which feature is actually being tested. Adding these 
				// properties to all adventures in a modular way instead makes 
				// the tests more difficult to read, so we simply test upgrading 
				// a single large adventure containing most or all of the 
				// relevant properties.
				test('general', () => {
					var before = {
						version: 4,
						title: 'Adventure',
						scenes: [
							// Scene with most features
							{
								name: 'Scene 1',
								key: '1',
								layer: 'background',
								mixin: true,
								fade: {
									duration: 2,
									direction: 'in out'
								},
								background: {
									color: '#123456'
								},
								image: {
									file: {
										id: 'image/1',
										name: 'Image 1.jpg',
										mimeType: 'image/jpeg'
									},
									size: 'cover'
								},
								sound: {
									tracks: [
										{
											id: 'track/1',
											name: 'Track 1.ogg',
											mimeType: 'audio/ogg'
										}
									],
									loop: true,
									shuffle: true,
									volume: 100,
									overlap: 2
								},
								text: {
									string: 'Text 1',
									size: 2,
									font: 'Font 1',
									color: '#123456',
									bold: true,
									italic: true,
									alignment: 'center',
									padding: 2
								}
							},
							// Scene without most features
							{
								name: 'Scene 2',
								key: '',
								layer: 'background',
								mixin: false,
								fade: {
									duration: 0,
									direction: 'in out'
								},
								background: { color: '#123456' },
								image: {
									file: null,
									size: 'cover'
								},
								sound: {
									tracks: [],
									loop: false,
									shuffle: false,
									volume: 0,
									overlap: 0
								},
								text: {
									string: '',
									size: 0,
									font: '',
									color: '#123456',
									bold: false,
									italic: false,
									alignment: 'left',
									padding: 0
								}
							},
							// Scene with most features but without most nested features
							{
								name: 'Scene 3',
								key: '3',
								layer: 'background',
								mixin: true,
								fade: {
									duration: 0,
									direction: 'in out'
								},
								background: { color: '#123456' },
								image: {
									file: {
										id: 'image/3',
										name: 'Image 3.jpg',
										mimeType: 'image/jpeg'
									},
									size: 'cover'
								},
								sound: {
									tracks: [
										{
											id: 'track/3',
											name: 'Track 3.ogg',
											mimeType: 'audio/ogg'
										}
									],
									loop: false,
									shuffle: false,
									volume: 0,
									overlap: 0
								},
								text: {
									string: 'Text 3',
									size: 0,
									font: '',
									color: '#123456',
									bold: false,
									italic: false,
									alignment: 'left',
									padding: 0
								}
							}
						]
					};
					
					var after = {
						version: 5,
						title: 'Adventure',
						scenes: [
							{
								name: 'Scene 1',
								key: '1',
								layer: 'background',
								fade: {
									duration: 2,
									in: true,
									out: true
								},
								background: '#123456',
								media: [
									{
										type: 'image',
										file: 'image/1',
										size: 'cover'
									},
									{
										type: 'text',
										string: 'Text 1',
										size: 2,
										font: 'Font 1',
										color: '#123456',
										bold: true,
										italic: true,
										alignment: 'center',
										padding: 2
									},
									{
										type: 'sound',
										tracks: ['track/1'],
										loop: true,
										shuffle: true,
										volume: 1.0,
										overlap: 2
									}
								]
							},
							{
								name: 'Scene 2',
								key: null,
								layer: 'background',
								fade: { duration: 0, in: true, out: true },
								background: '#123456',
								media: []
							},
							{
								name: 'Scene 3',
								key: '3',
								layer: 'background',
								fade: {
									duration: 0,
									in: true,
									out: true
								},
								background: '#123456',
								media: [
									{
										type: 'image',
										file: 'image/3',
										size: 'cover'
									},
									{
										type: 'text',
										string: 'Text 3',
										size: 0,
										font: null,
										color: '#123456',
										bold: false,
										italic: false,
										alignment: 'left',
										padding: 0
									},
									{
										type: 'sound',
										tracks: ['track/3'],
										loop: false,
										shuffle: false,
										volume: 0,
										overlap: 0
									}
								]
							}
						]
					};
					
					assertEqual(upgrade(before), after);
				});
				
				test('only accepts version 4 adventures', function() {
				    assertError(() => upgrade({
						title: 'Adventure',
						scenes: [],
						version: 3 
					}), /version/);
				});
			});
		});
	});
});
