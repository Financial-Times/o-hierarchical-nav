/*global exports*/
'use strict';

// Helper function that converts a list of elements into an array
function nodeListToArray(nl) {
	return [].map.call(nl, function(element) {
		return element;
	});
}

// Helper function to dispatch events
function dispatchCustomEvent(el, name, data) {
	if (document.createEvent && el.dispatchEvent) {
		var event = document.createEvent('Event');
		event.initEvent(name, true, true);
		if (data) {
			event.detail = data;
		}
		el.dispatchEvent(event);
	}
}

exports.nodeListToArray = nodeListToArray;
exports.dispatchCustomEvent = dispatchCustomEvent;
