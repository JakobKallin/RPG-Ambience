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
					return {
						backgroundColor: scene.background.color,
						backgroundImage: scene.image.css,
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