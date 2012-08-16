Ambience.Text = function(container) {
	var outerNode; // This one is needed to have left-aligned text in the center, without filling the entire width.
	var innerNode;
	
	function play(scene) {
		outerNode = document.createElement('div');
		outerNode.className = 'text outer';
		innerNode = document.createElement('div');
		innerNode.className = 'text inner';
		outerNode.appendChild(innerNode);
		
		innerNode.textContent = scene.text;
		for ( var property in scene.textStyle ) {
			var value = scene.textStyle[property];
			innerNode.style[property] = value;
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