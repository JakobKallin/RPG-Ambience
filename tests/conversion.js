// This file is part of Ambience Stage
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

describe('Adventure conversion', function() {
	it('converts from 1 to 2', function() {
		var current = {
			"title": "Test adventure",
			"version": 1,
			"scenes": [
				{
					"name": "Test scene",
					"key": "T",
					"layer": "foreground",
					"mixin": true,
					"background": "#abcdef",
					"fade": "1",
					"fadeDirection": "in out",
					"image": {
						"path": "",
						"name": "Test.jpg",
						"id": "Test ID",
						"size": "cover"
					},
					"sound": {
						"tracks": [
							{
								"name": "Test.mp3",
								"path": "",
								"id": "Test ID",
								"isPlayable": true
							}
						],
						"loop": true,
						"shuffle": true,
						"volume": "50",
						"crossover": "1"
					},
					"text": {
						"string": "Test string",
						"size": "5",
						"font": "Test font",
						"color": "#abcdef",
						"bold": true,
						"italic": true,
						"alignment": "center",
						"padding": "10"
					},
					"media": []
				}
			],
			"media": []
		};

		var next = {
			"title": "Test adventure",
			"version": 2,
			"scenes": [
				{
					"name": "Test scene",
					"key": "T",
					"layer": "foreground",
					"mixin": true,
					"background": {
						"color": "#abcdef"
					},
					"fade": {
						"direction": "in out",
						"duration": 1
					},
					"image": {
						"file": {
							"name": "Test.jpg",
							"id": "Test ID"
						},
						"size": "cover"
					},
					"sound": {
						"tracks": [
							{
								"name": "Test.mp3",
								"id": "Test ID"
							}
						],
						"loop": true,
						"shuffle": true,
						"volume": 50,
						"overlap": 1
					},
					"text": {
						"string": "Test string",
						"size": 5,
						"font": "Test font",
						"color": "#abcdef",
						"bold": true,
						"italic": true,
						"alignment": "center",
						"padding": 10
					}
				}
			]
		};
		
		Ambience.App.Adventure.upgradeConfig(current)
		expect(current).toEqual(next);
	});
});