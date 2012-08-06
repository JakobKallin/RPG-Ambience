var Splitter = function(container, initialLeftWidth) {
	var left = container.firstElementChild;
	var right = left.nextElementSibling;
	var splitter = createSplitter();
	
	var isPressed = false;
	
	update(initialLeftWidth);
	
	splitter.addEventListener('mousedown', onMouseDown);
	document.addEventListener('mouseup', onMouseUp);
	document.addEventListener('mousemove', onMouseMove);
	
	function createSplitter() {
		var splitter = document.createElement('div');
		splitter.className = 'splitter';
		left.appendChild(splitter);
		
		return splitter;
	}
	
	function update(newLeftWidth) {
		var newRightWidth = 1 - newLeftWidth;
		left.style.width = (newLeftWidth * 100) + '%';
		right.style.width = (newRightWidth * 100) + '%';
	}
	
	function onMouseDown(event) {
		event.preventDefault();
		isPressed = true;
	}
	
	function onMouseUp(event) {
		event.preventDefault();
		isPressed = false;
	}
	
	function onMouseMove(event) {
		if ( isPressed ) {
			var mouseX = event.clientX;
			var percentX = mouseX / document.body.offsetWidth;
			update(percentX);
		}
	}
};