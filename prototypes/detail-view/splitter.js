var Splitter = function(container, initialLeftWidth) {
	var splitter = createSplitter();
	var isPressed = false;
	var latestLeftWidth;
	
	update(initialLeftWidth);
	
	splitter.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('mousemove', onMouseMove);
	
	function left() {
		return container.firstElementChild;
	}
	
	function right() {
		return left().nextElementSibling;
	}
	
	function createSplitter() {
		var splitter = document.createElement('div');
		splitter.className = 'splitter';
		left().appendChild(splitter);
		
		return splitter;
	}
	
	function update(newLeftWidth) {
		if ( newLeftWidth === undefined ) {
			newLeftWidth = latestLeftWidth;
		}
		
		var newRightWidth = 1 - newLeftWidth;
		left().style.width = (newLeftWidth * 100) + '%';
		right().style.width = (newRightWidth * 100) + '%';
		
		latestLeftWidth = newLeftWidth;
	}
	
	function onMouseDown(event) {
		event.preventDefault();
		isPressed = true;
		document.body.style.cursor = 'w-resize';
	}
	
	function onMouseUp(event) {
		event.preventDefault();
		isPressed = false;
		document.body.style.cursor = 'auto';
	}
	
	function onMouseMove(event) {
		if ( isPressed ) {
			var mouseX = event.clientX;
			var percentX = mouseX / document.body.offsetWidth;
			update(percentX);
		}
	}
	
	return {
		update: update
	};
};