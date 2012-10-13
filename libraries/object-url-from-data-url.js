var objectURLFromDataURL = function(dataURL) {
	var base64 = dataURL.substring(dataURL.indexOf(',') + 1);
	var byteString = atob(base64);
	var mimeType = dataURL.substring(dataURL.indexOf(':') + 1, dataURL.indexOf(';'));
	
	var array = [];
	for ( var i = 0; i < byteString.length; ++i ) {
		array.push(byteString.charCodeAt(i));
	}
	var blob = new Blob([new Uint8Array(array)], { type: mimeType });
	
	var URL = window.URL || window.webkitURL;
	var objectUrl = URL.createObjectURL(blob);
	
	return objectUrl;
};