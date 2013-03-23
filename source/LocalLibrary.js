Ambience.App.LocalLibrary = function() {
	var adventures = [];
	adventures.haveLoaded = false;
	adventures.load = function(onLoad) {
		if ( adventures.haveLoaded ) {
			return;
		}
		
		for ( var i = 0; i < localStorage.length; ++i ) {
			var config = JSON.parse(localStorage.getItem(i));
			var adventure = Ambience.App.Adventure.fromConfig(config);
			this.push(adventure);
			onLoad(adventure);
		}
		
		adventures.haveLoaded = true;
	};
	
	function selectImage(onLoad) {
		// We create a new file input on every click because we want a change event even if we select the same file.
		var input = document.createElement('input');
		input.type = 'file';
		input.multiple = true;
		
		// We need to actually insert the node for IE10 to accept the click() call below.
		input.style.display = 'none';
		document.body.appendChild(input);
		
		// This should be before the call to click.
		// It makes more sense semantically, and IE10 seems to require it.
		input.addEventListener('change', function(event) {
			var file = event.target.files[0];
			var objectURL = window.URL.createObjectURL(file);
			var id = objectURL.replace(/^blob:/, '');
			
			onLoad({
				name: file.name,
				url: objectURL,
				id: id
			});
		});
		
		input.click();
	};
	
	return {
		adventures: adventures,
		selectImage: selectImage
	};
};