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

///////////////////////////////////////////////////////////////////////////////
//
// Constants
//
///////////////////////////////////////////////////////////////////////////////

// properties
Alloy.Globals.PROPERTY_ENABLE_MOTION_ANIMATION = 'PROPERTY_ENABLE_MOTION_ANIMATION';
Alloy.Globals.PROPERTY_ENABLE_LIST_ANIMATION = 'PROPERTY_ENABLE_LIST_ANIMATION';

// set default properties
if (!Ti.App.Properties.hasProperty(Alloy.Globals.PROPERTY_ENABLE_MOTION_ANIMATION)) {
	Ti.App.Properties.setBool(Alloy.Globals.PROPERTY_ENABLE_MOTION_ANIMATION, true);
}
if (!Ti.App.Properties.hasProperty(Alloy.Globals.PROPERTY_ENABLE_LIST_ANIMATION)) {
	Ti.App.Properties.setBool(Alloy.Globals.PROPERTY_ENABLE_LIST_ANIMATION, true);
};

// events
Alloy.Globals.EVENT_PROPERTY_ENABLE_MOTION_ANIMATION_DID_CHANGE = 'EVENT_PROPERTY_ENABLE_MOTION_ANIMATION_DID_CHANGE';
Alloy.Globals.EVENT_PROPERTY_ENABLE_LIST_ANIMATION_DID_CHANGE = 'EVENT_PROPERTY_ENABLE_LIST_ANIMATION_DID_CHANGE';



///////////////////////////////////////////////////////////////////////////////
//
// Navigation singleton
//
///////////////////////////////////////////////////////////////////////////////

/**
 * The navigator object which handles all navigation
 * @type {Object}
 */
Alloy.Globals.Navigator = {};

/**
 * Init navigation
 * Called from index controller once intro animation is complete
 */
Alloy.Globals.initNavigation = function() {		
	// Require in the navigation module
    Alloy.Globals.Navigator = require("navigation")({
        parent: Alloy.Globals.navigationWindow || null
    });
};



///////////////////////////////////////////////////////////////////////////////
//
// Device singleton
//
///////////////////////////////////////////////////////////////////////////////

/**
 * Device information, some come from the Ti API calls and can be referenced
 * from here so multiple bridge calls aren't necessary, others generated here
 * for ease of calculations and such.
 *
 * @type {Object}
 * @param {String} version The version of the OS
 * @param {Number} versionMajor The major version of the OS
 * @param {Number} versionMinor The minor version of the OS
 * @param {Number} width The width of the device screen
 * @param {Number} height The height of the device screen
 * @param {Number} dpi The DPI of the device screen
 * @param {String} orientation The device orientation, either "landscape" or "portrait"
 * @param {String} statusBarOrientation A Ti.UI orientation value
 */
Alloy.Globals.Device = {
	version: Ti.Platform.version,
	versionMajor: parseInt(Ti.Platform.version.split(".")[0], 10),
	versionMinor: parseInt(Ti.Platform.version.split(".")[1], 10),
	width: (Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight) ? Ti.Platform.displayCaps.platformHeight : Ti.Platform.displayCaps.platformWidth,
	height: (Ti.Platform.displayCaps.platformWidth > Ti.Platform.displayCaps.platformHeight) ? Ti.Platform.displayCaps.platformWidth : Ti.Platform.displayCaps.platformHeight,
	dpi: Ti.Platform.displayCaps.dpi,
	orientation: Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT || Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT ? "landscape" : "portrait"
};

if(OS_ANDROID) {
	Alloy.Globals.Device.width = (Alloy.Globals.Device.width / (Alloy.Globals.Device.dpi / 160));
	Alloy.Globals.Device.height = (Alloy.Globals.Device.height / (Alloy.Globals.Device.dpi / 160));
}

Alloy.Globals.dpToPx = function(dp) {
	return dp * (Ti.Platform.displayCaps.platformHeight / Alloy.Globals.Device.height);
};

Alloy.Globals.pxToDp = function(px) {
	return px * (Alloy.Globals.Device.height / Ti.Platform.displayCaps.platformHeight);
};


///////////////////////////////////////////////////////////////////////////////
//
// Orientation helpers
//
///////////////////////////////////////////////////////////////////////////////

/**
 * Helper to bind the orientation events to a controller.
 *
 * **NOTE** It is VERY important this is
 * managed right because we're adding global events. They must be removed
 * or a leak can happen because of all the closures. We could slightly
 * reduce the closures if we placed these in the individual controllers
 * but then we're duplicating code. This keeps the controllers clean. Currently,
 * this method will _add_ and _remove_ the global events, so things should go
 * out of scope and GC'd correctly.
 *
 * @param {Controllers} _controller The controller to bind the orientation events
 */
Alloy.Globals.bindOrientationEvents = function(_controller) {
	_controller.window.addEventListener("close", function() {
		if(_controller.handleOrientation) {
			Ti.App.removeEventListener("orientationChange", _controller.handleOrientation);
		}
	});
	
	_controller.window.addEventListener("open", function() {
		Ti.App.addEventListener("orientationChange", function(_event) {
			if(_controller.handleOrientation) {
				_controller.handleOrientation(_event);
			}
			
			setViewsForOrientation(_controller);
		});
	});
};

/**
 * Handle the orientation change event callback
 * @param {Object} _event Standard Ti Callback
 */
function orientationChange(_event) {
	// Ignore face-up, face-down and unknown orientation
	if(_event.orientation === Titanium.UI.FACE_UP || _event.orientation === Titanium.UI.FACE_DOWN || _event.orientation === Titanium.UI.UNKNOWN) {
		return;
	}

	Alloy.Globals.Device.orientation = _event.source.isLandscape() ? "landscape" : "portrait";

	/**
	 * Fires an event for orientation change handling throughout the app
	 * @event orientationChange
	 */
	Ti.App.fireEvent("orientationChange", {
		orientation: Alloy.Globals.Device.orientation
	});
}
Ti.Gesture.addEventListener("orientationchange", orientationChange);

/**
 * Update views for current orientation helper
 *
 * We're doing this because Alloy does not have support for
 * orientation support in tss files yet. In order not to duplicate
 * a ton of object properties, hardcode them, etc. we're using this method.
 *
 * Once Alloy has orientation support (e.g. `#myElement[orientation=landscape]`), this
 * can be removed and the tss reworked.
 *
 * All that has to be done is implement the following structure in a `.tss` file:
 * 		"#myElement": {
 * 			landscape: { backgroundColor: "red" },
 * 			portrait: { backgroundColor: "green" }
 * 		}
 *
 * @param {Controllers} _controller
 */
function setViewsForOrientation(_controller) {
	if(!Alloy.Globals.Device.orientation) {
		return;
	}
	
	// Restricted the UI for portrait and landscape orientation
	if(Alloy.Globals.Device.orientation == "portrait" || Alloy.Globals.Device.orientation == "landscape") {
		for(var view in _controller.__views) {
			if(_controller.__views[view][Alloy.Globals.Device.orientation] && typeof _controller.__views[view].applyProperties == "function") {
				_controller.__views[view].applyProperties(_controller.__views[view][Alloy.Globals.Device.orientation]);
			} else if(_controller.__views[view].wrapper && _controller.__views[view].wrapper[Alloy.Globals.Device.orientation] && typeof _controller.__views[view].applyProperties == "function") {
				_controller.__views[view].applyProperties(_controller.__views[view].wrapper[Alloy.Globals.Device.orientation]);
			}
		}
	}
}



///////////////////////////////////////////////////////////////////////////////
//
// Layout
//
///////////////////////////////////////////////////////////////////////////////

/**
 * Calculate element dimensions for given screen size
 * @param {Object} size		containing width and height properties
 */
Alloy.Globals.calculateElementDimensions = function(size) {
		
	var layout = {};
	
	// intro
	layout.intro = {};
	layout.intro.clapperTopContainerTop = size.height/2 - 43;
	layout.intro.clapperTopContainerLeft = size.width/2 - 150;
	layout.intro.clapperBottomTop = layout.intro.clapperTopContainerTop + 31;
	layout.intro.clapperBottomLeft = size.width/2 - 50;
	layout.intro.activityViewTop = layout.intro.clapperTopContainerTop + 130;
	
	// options buttons
	layout.optionButtons = {};
	layout.optionButtons.width = size.width / 3;
	layout.optionButtons.height = layout.optionButtons.width * 0.3; 
	
	// form
	layout.overlay = {};
	layout.overlay.width = (size.width > 400) ? 360 : (size.width - 40);
	
	// lists
	layout.lists = {};
	layout.lists.userCell = {};
	layout.lists.userCell.width = size.width - 20;
	layout.lists.userCell.imageLeft = -layout.lists.userCell.width / 6;
	layout.lists.userCell.imageWidth = Math.abs(layout.lists.userCell.imageLeft * 2) + layout.lists.userCell.width;
	layout.lists.userCell.imageHeight = Math.ceil(layout.lists.userCell.imageWidth * 9) / 16;
	
	layout.lists.cell = {};
	layout.lists.cell.width = (size.width - 30) / 2;
	layout.lists.cell.height = layout.lists.cell.width;
	layout.lists.cell.imageTop = -20;
	layout.lists.cell.imageLeft = -layout.lists.cell.width;
	layout.lists.cell.imageWidth = Math.abs(layout.lists.cell.imageLeft * 2) + layout.lists.cell.width;
	layout.lists.cell.imageHeight = Math.ceil(layout.lists.cell.imageWidth * 9) / 16;
	
	// movies list
	layout.list = {};
	layout.list.row = {};
	layout.list.row.width = size.width;
	layout.list.row.height = Math.ceil(size.width / 2.5);
	layout.list.row.imageHeight = Math.ceil((size.width * 9) / 16);
	
	// movie
	layout.movie = {};
	layout.movie.backdropImageLeft = -size.width * 0.15;
	layout.movie.backdropImageWidth = size.width * 1.3;
	layout.movie.backdropImageHeight = Math.ceil((layout.movie.backdropImageWidth * 9) / 16);
	layout.movie.titleTop = layout.movie.backdropImageHeight * 0.5;
	layout.movie.detailsTop = 15; 
	layout.movie.posterWidth = Math.ceil(size.width / 3);
	layout.movie.posterHeight = layout.movie.posterWidth * 1.5; 
	layout.movie.infoLeft = layout.movie.posterWidth + 15; 
	layout.movie.infoWidth = size.width - layout.movie.infoLeft - 20;
	layout.movie.linkButtonTop = layout.movie.posterTop + 40;
	layout.movie.linkButtonWidth = (layout.movie.infoWidth - 10) / 2;
	if (OS_ANDROID) layout.movie.linkButtonWidth -= 1;  
	layout.movie.imdbButtonLeft =  + layout.movie.infoLeft + layout.movie.linkButtonWidth + 10; 
	layout.movie.synopsisTop = 20;
	
	return layout;
};

// Calculate element dimentsions
Alloy.Globals.layout = Alloy.Globals.calculateElementDimensions(Alloy.Globals.Device);
	
/**
 * Backdrop image size
 * Calculate best size image based on config
 */
Alloy.Globals.backdropImageSize = 'original';
Alloy.Globals.setBackdropImageSize = function(sizes) {
	Alloy.Globals.backdropImageSize = getBestImageSize(sizes, Alloy.Globals.Device.width);
	Ti.API.info("Backdrop size for " + Alloy.Globals.Device.width + ": " + Alloy.Globals.backdropImageSize);
};

/**
 * Poster image size
 * Calculate best size image based on config
 */
Alloy.Globals.posterImageSize = 'original';
Alloy.Globals.setPosterImageSize = function(sizes) {
	Alloy.Globals.posterImageSize = getBestImageSize(sizes, Alloy.Globals.layout.movie.posterWidth);
	Ti.API.info("Poster size for " + Alloy.Globals.layout.movie.posterWidth  + ": " + Alloy.Globals.posterImageSize);
};

/**
 * Returns next largest size for given target
 * @param {Array} sizes		list of size strings
 * @param {Number} target	target size
 */
function getBestImageSize(sizes, target) {
	var bestSizeValue = 999999;
	var bestSize = 'original';
	for (var i=0; i<sizes.length; i++) {
		var size = sizes[i];
		if (size != 'original') {
			var sizeValue = parseInt(size.substr(1, size.length));
			if (sizeValue < bestSizeValue && sizeValue > target) {
				bestSizeValue = sizeValue;
				bestSize = size;
			}
		}
	}
	return bestSize;
}



///////////////////////////////////////////////////////////////////////////////
//
// Unit tests
//
///////////////////////////////////////////////////////////////////////////////

/**
 * Unit test runner
 */
if (!ENV_PRODUCTION) {
	// if tests are enabled in config, execute test runner
	if (Alloy.CFG.run_logic_tests) {
		require('tests/tests_runner');
	}
}
