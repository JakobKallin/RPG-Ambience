Ambience.immersive.menu = function() {
	var node = document.getElementById('menu');
	var fileChooser = document.getElementById('file-chooser');
	
	node.addEventListener('drop', function(event) {
		event.stopPropagation();
		event.preventDefault();
		loadAdventureFile(event.dataTransfer.files[0]);
	});
	
	node.addEventListener('dragover', function(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy';
	});
	
	fileChooser.addEventListener('change', function() {
		loadAdventureFile(this.files[0]);
	});
}();