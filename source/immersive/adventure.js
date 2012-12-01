var Adventure = function() {
	var self = this;
	
	self.scenes = [];
	
	Object.defineProperty(self, 'media', {
		get: function() {
			return self.scenes.map(get('media')).flatten();
		}
	});
};