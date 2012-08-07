var splitter;
var ambience;
			
var viewModel = new function() {
	var self = this;
	
	self.editorWidth = 0.6;
	
	self.scenes = ko.observableArray([
		{
			name: ko.observable('City'),
			image: ko.observable('examples/ishtar_rooftop.jpg'),
			sound: ko.observable('music.mp3'),
			text: ko.observable(null),
			color: ko.observable('#000000'),
			size: ko.observable('cover'),
			key: ko.observable('F1')
		},
		{
			name: ko.observable('Portrait'),
			image: ko.observable('examples/jack-face-details.jpg'),
			sound: ko.observable(null),
			text: ko.observable(null),
			color: ko.observable('#ffffff'),
			size: ko.observable('contain'),
			key: ko.observable('F2')
		},
		{
			name: ko.observable('Shaman'),
			image: ko.observable('examples/shaman-previz.jpg'),
			sound: ko.observable(null),
			text: ko.observable(null),
			color: ko.observable('#000000'),
			size: ko.observable('cover'),
			key: ko.observable('F3')
		}
	]);
	
	self.current = ko.observable();
	
	self.select = function(scene) {
		self.current(scene);
		$('details').details();
		splitter.update();
	};
	
	self.add = function() {
		self.scenes.push(wrapScene({
			name: ko.observable('Untitled scene'),
			image: ko.observable(''),
			sound: ko.observable(''),
			text: ko.observable(''),
			color: ko.observable('#000000'),
			size: ko.observable('contain'),
			key: ko.observable(null)
		}));
		self.select(self.last());
	};
	
	self.previous = function() {
		var index = self.scenes.indexOf(self.current());
		if ( index > 0 ) {
			return self.scenes()[index - 1];
		} else {
			return null;
		}
	};
	
	self.next = function() {
		var index = self.scenes.indexOf(self.current());
		if ( index < self.scenes().length - 1 ) {
			return self.scenes()[index + 1];
		} else {
			return null;
		}
	};
	
	self.last = function() {
		var index = self.scenes().length - 1;
		if ( index !== -1 ) {
			return self.scenes()[index];
		} else {
			return null;
		}
	};
	
	self.removeSelected = function() {
		var previous = self.previous();
		var next = self.next();
		
		if ( self.previous() ) {
			self.select(previous);
		} else if ( next ) {
			self.select(next);
		} else {
			self.select(null);
		}
		
		var index = viewModel.scenes.indexOf(this);
		self.scenes.splice(index, 1);
	};
	
	self.copySelected = function() {
		var newScene = {};
		for ( var property in this ) {
			newScene[property] = ko.observable(this[property]());
		};
		wrapScene(newScene);
		
		var index = self.scenes.indexOf(self.current()) + 1;
		self.scenes.splice(index, 0, newScene);
		self.select(newScene);
	};
	
	self.handleDroppedFile = function(scene, event) {
		event.preventDefault();
		event.stopPropagation();
		
		var file = event.originalEvent.dataTransfer.files[0];
		var reader = new FileReader();
		reader.onload = function(event) {
			scene.image(event.target.result);
		}
		reader.readAsDataURL(file);
	};
	
	self.handleDrag = function(scene, event) {
		event.preventDefault();
		event.stopPropagation();
		event.dataTransfer.dropEffect = 'copy';
	};
	
	self.hideEditor = function() {
		self.editorWidth = splitter.leftWidth;
		splitter.update(0);
	};
	
	self.showEditor = function() {
		splitter.update(self.editorWidth);
	};
	
	self.toggleEditor = function() {
		if ( splitter.leftWidth === 0 ) {
			self.showEditor();
		} else {
			self.hideEditor();
		}
	};
}();

var wrapScene = function(scene) {
	scene.imageCss = ko.computed(function() {
		return 'url("' + this.image() + '")';
	}, scene);
	scene.isSelected = ko.computed(function() {
		return this === viewModel.current();
	}, scene);
	
	return scene;
};

viewModel.scenes().map(wrapScene);

window.addEventListener('load', function() {
	splitter = new Splitter(document.body, viewModel.editorWidth);
	ko.applyBindings(viewModel);
	viewModel.select(viewModel.scenes()[0]);
	
	$('.list-view ul').sortable({
		axis: 'y'
	});
	
	ambience = new Ambience(
		new Ambience.Layer(document.getElementById('background')),
		new Ambience.Layer(document.getElementById('foreground'))
	);
});