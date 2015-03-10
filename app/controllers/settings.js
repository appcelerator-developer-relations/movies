/**
 * Movies
 * 
 * @copyright
 * Copyright (c) 2015 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

var args = arguments[0] || {};

function init() {
	$.motion_switch.value = Ti.App.Properties.getBool(Alloy.Globals.PROPERTY_ENABLE_MOTION_ANIMATION);
	$.list_animation_switch.value = Ti.App.Properties.getBool(Alloy.Globals.PROPERTY_ENABLE_LIST_ANIMATION);
}
init();


///////////////////////////////////////////////////////////////////////////////
//
// event handlers
//
///////////////////////////////////////////////////////////////////////////////

$.motion_switch.addEventListener('change', function(e) {
	Ti.Analytics.featureEvent('edit:motion.' + e.value);
	Ti.App.Properties.setBool(Alloy.Globals.PROPERTY_ENABLE_MOTION_ANIMATION, e.value);
	Ti.App.fireEvent(Alloy.Globals.EVENT_PROPERTY_ENABLE_MOTION_ANIMATION_DID_CHANGE, {value: e.value});
});

$.list_animation_switch.addEventListener('change', function(e) {
	Ti.Analytics.featureEvent('edit:parallax.' + e.value);
	Ti.App.Properties.setBool(Alloy.Globals.PROPERTY_ENABLE_LIST_ANIMATION, e.value);
	Ti.App.fireEvent(Alloy.Globals.EVENT_PROPERTY_ENABLE_LIST_ANIMATION_DID_CHANGE, {value: e.value});
});
