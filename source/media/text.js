Ambience.Text = function(container) {
	var outerNode; // This one is needed to have left-aligned text in the center, without filling the entire width.
	var innerNode;
	
	function play(scene) {
		outerNode = document.createElement('div');
		outerNode.className = 'text';
		innerNode = document.createElement('div');
		outerNode.appendChild(innerNode);
		
		innerNode.textContent = scene.text;
		for ( var cssProperty in scene.textStyle ) {
			var cssValue = scene.textStyle[cssProperty];
			innerNode.style[cssProperty] = cssValue;
		}
		
		container.appendChild(outerNode);
	}
	
	function stop() {
		container.removeChild(outerNode);
		outerNode = null;
		innerNode = null;
	}
	
	return {
		play: play,
		stop: stop
	};
};