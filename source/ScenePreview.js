// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.ScenePreview = function() {
	return {
		restrict: 'E',
		template:
			'<div class="preview" ng-style="layerStyle">' +
				'<div class="text outer">' +
					'<div class="text inner" ng-style="textStyle" data-ng-show="scene.text.string">{{scene.text.string}}</div>' +
					// We create a second text element and overload it to contain an audio symbol for audio-only scenes.
					// This is a bit of a hack, but it should work fine since an audio-only scene should by definition never have text.
					'<div class="text inner sound" data-ng-show="scene.isAural && !scene.isVisual">♫</div>' +
				'</div>' +
			'</div>',
		scope: {
			scene: '='
		},
		replace: true,
		link: function(scope, $element, attrs) {
			var layer = $element[0];
			var text = layer.querySelector('.text.inner');
			
			Object.defineProperty(scope, 'layerStyle', {
				get: function() {
					var scene = scope.scene;
					if ( scene.image.file && (scene.image.file.previewUrl || scene.image.file.url) ) {
						var url = scene.image.file.previewUrl || scene.image.file.url;
						// This should probably be encoded, but encoding prevents object URLs from working here.
						var css = 'url("' + url + '")';
					} else {
						var css = undefined;
					}
					
					return {
						backgroundColor: scene.background.color,
						backgroundImage: css,
						backgroundSize: scene.image.size
					};
				}
			});
			
			Object.defineProperty(scope, 'textStyle', {
				get: function() {
					var text = scope.scene.text;
					var previewSize = (text.size / 100) + 'em';
					var previewPadding = '0 ' + text.padding + '%';
					
					return {
						fontSize: previewSize,
						fontFamily: text.font,
						fontStyle: text.style,
						fontWeight: text.weight,
						color: text.color,
						textAlign: text.alignment,
						padding: previewPadding
					};
				}
			});
		}
	};
};