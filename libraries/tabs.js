var Tabs = function(container) {
	var module = {
		select: select,
		onSelected: null
	};
	
	activateLinks();
	select(0);
	
	function activateLinks() {
		// Nodes are retrieved here because Knockout templating appears to replace them at some point if they are inside virtual elements.
		var tabs = array(container.firstElementChild.children);
		var links = tabs.map(function(tab) {
			return tab.querySelector('a'); 
		});
		
		links.forEach(function(link, index) {
			link.addEventListener('click', function(event) {
				select(index);
				event.preventDefault();
			});
		});
	};
	
	function select(index) {
		// Nodes are retrieved here because Knockout templating appears to replace them at some point if they are inside virtual elements.
		var tabs = array(container.firstElementChild.children);
		var panels = array(container.children).slice(1);
		
		tabs.forEach(function(element) {
			element.classList.remove('selected');
		});
		tabs[index].classList.add('selected');
		
		panels.forEach(function(element) {
			element.classList.remove('selected');
			element.style.display = 'none';
		});
		panels[index].classList.add('selected');
		panels[index].style.display = '';
		
		if ( module.onSelected ) {
			module.onSelected(index);
		}
	};
	
	function array(nodeList) {
		var a = new Array(nodeList.length);
		for ( var i = 0; i < nodeList.length; ++i ) {
			a[i] = nodeList[i];
		}
		return a;
	};
	
	return module;
};