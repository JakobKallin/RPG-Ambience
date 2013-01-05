// This file is part of Ambience Stage
// Copyright 2012 Jakob Kallin
// License: GNU GPL (http://www.gnu.org/licenses/gpl-3.0.txt)

(function() {
	var OldStage = Ambience.Stage;
	Ambience.Stage = function(node) {
		var stage = new OldStage(node);
		
		Object.defineProperty(stage, 'imageNode', {
			get: function() {
				return node.querySelector('.image');
			}
		});
		
		Object.defineProperty(stage, 'imageCount', {
			get: function() {
				return node.querySelectorAll('.image').length;
			}
		});
		
		Object.defineProperty(stage, 'soundNode', {
			get: function() {
				return node.getElementsByTagName('audio')[0];
			}
		});
		Object.defineProperty(stage, 'soundCount', {
			get: function() {
				return node.getElementsByTagName('audio').length;
			}
		});
		
		Object.defineProperty(stage, 'textNode', {
			get: function() {
				return node.querySelector('.text');
			}
		});
		
		Object.defineProperty(stage, 'textCount', {
			get: function() {
				return node.querySelectorAll('.text.outer').length;
			}
		});
		
		Object.defineProperty(stage, 'opacity', {
			get: function() {
				return Number(node.style.opacity);
			}
		});
		
		Object.defineProperty(stage, 'background', {
			get: function() {
				return node.style.background;
			}
		});
		
		return stage;
	};
})();