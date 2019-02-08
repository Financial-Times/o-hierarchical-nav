/*global exports*/

// Helper function that converts a list of elements into an array
function nodeListToArray(nl) {
	return [].map.call(nl, function(element) {
		return element;
	});
}

// Helper function to dispatch events
function dispatchCustomEvent(el, name, data) {
	if (document.createEvent && el.dispatchEvent) {
		const event = document.createEvent('Event');
		event.initEvent(name, true, true);

		if (data) {
			event.detail = data;
		}

		el.dispatchEvent(event);
	}
}

function detectedIE8() {
	const b = document.createElement('B');
	const docElem = document.documentElement;
	let isIE;

	b.innerHTML = '<!--[if IE 8]><b id="ie8test"></b><![endif]-->';
	docElem.appendChild(b);
	isIE = !!document.getElementById('ie8test');
	docElem.removeChild(b);
	return isIE;
}

export var isIE8 = detectedIE8();
export {nodeListToArray};
export {dispatchCustomEvent};
