window.debug = function(message) {
	if ( window.location.search === '?debug' ) {
		console.log(message);
	}
};