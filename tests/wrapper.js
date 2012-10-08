(function() {
	var OldLayer = Ambience.Layer;
	Ambience.Layer = function(node) {
		var layer = new OldLayer(node);
		
		Object.defineProperty(layer, 'imageNode', {
			get: function() {
				return node.querySelector('.image');
			}
		});
		
		Object.defineProperty(layer, 'imageCount', {
			get: function() {
				return node.querySelectorAll('.image').length;
			}
		});
		
		Object.defineProperty(layer, 'soundNode', {
			get: function() {
				return node.getElementsByTagName('audio')[0];
			}
		});
		Object.defineProperty(layer, 'soundCount', {
			get: function() {
				return node.getElementsByTagName('audio').length;
			}
		});
		
		Object.defineProperty(layer, 'textNode', {
			get: function() {
				return node.querySelector('.text');
			}
		});
		
		Object.defineProperty(layer, 'textCount', {
			get: function() {
				return node.querySelectorAll('.text.outer').length;
			}
		});
		
		Object.defineProperty(layer, 'opacity', {
			get: function() {
				return Number(node.style.opacity);
			}
		});
		
		Object.defineProperty(layer, 'backgroundColor', {
			get: function() {
				return node.style.backgroundColor;
			}
		});
		
		return layer;
	};
})();