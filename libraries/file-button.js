var FileButton = function(button) {
	button.addEventListener('click', function() {
		var input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		input.click();
		
		input.addEventListener('change', function(inputEvent) {
			button.files = inputEvent.target.files;
			var buttonEvent = new CustomEvent('change');
			button.dispatchEvent(buttonEvent);
		});
	});
	
	return button;
};