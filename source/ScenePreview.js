// This file is part of RPG Ambience
// Copyright 2012-2013 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

Ambience.ScenePreview = function() {
	return {
		restrict: 'E',
		template:
			'<div class="preview" ng-style="layerStyle">' +
				'<div class="text outer">' +
					'<div class="text inner" ng-style="textStyle">{{scene.text.string}}</div>' +
				'</div>' +
			'</div>',
		scope: {
			scene: '=ngScene'
		},
		replace: true,
		link: function(scope, $element, attrs) {
			var element = $element[0];
			var layer = element;
			var text = element.querySelector('.text.inner');
			
			Object.defineProperty(scope, 'layerStyle', {
				get: function() {
					var scene = scope.scene;
					if ( scene.image.file && scene.image.file.thumbnail ) {
						// This should probably be encoded, but encoding prevents object URLs from working here.
						var css = 'url("' + scene.image.file.thumbnail + '")';
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