var FileButton = function(button) {
	var input = document.createElement('input');
	input.type = 'file';
	input.multiple = true;
	input.addEventListener('change', function(inputEvent) {
		button.files = inputEvent.target.files;
		var buttonEvent = new CustomEvent('change');
		button.dispatchEvent(buttonEvent);
	});
	
	button.addEventListener('click', function() {
		input.click();		
	});
	
	return button;
};