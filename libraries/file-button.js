var FileButton = function(button) {
	button.addEventListener('click', function() {
		// We create a new file input on every click because we want a change event even if we select the same file.
		var input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		
		// We need to actually insert the node for IE10 to accept the click() call below.
		input.style.display = 'none';
		button.parentNode.insertBefore(input, button);
		
		// This should be before the call to click.
		// It makes more sense semantically, and IE10 seems to require it.
		input.addEventListener('change', function(inputEvent) {
			button.files = inputEvent.target.files;
			var buttonEvent = document.createEvent('CustomEvent');
			buttonEvent.initCustomEvent('change', true, true, null);
			button.dispatchEvent(buttonEvent);
		});
		
		input.click();
	});
	
	return button;
};