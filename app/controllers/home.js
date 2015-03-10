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

var Data = require("data"),
	theMovieDb = require('themoviedb');
if (OS_IOS) {
	var CoreMotion = require("ti.coremotion");
}

var args = arguments[0] || {};
var loaded_callback = args.loaded_callback;

var lists = [];
var genres = [];
var cells = [];
var image_animation_interval = null;
var displaying_overlay = false;
var overlay_controller;
var android_back_event_listener;
var displaying_search = false;
var cellOffset = (OS_IOS) ? 20 : 0;

/**
 * init
 */
function init() {

	configureStaticCells();

	getConfig();
	getLists();

	// not required when loading local data
	// $.activity_indicator.show();

	if (OS_IOS) {
		$.navbar.back_button.hide();
	}

	if (OS_ANDROID) {
		$.window.addEventListener('open', function(e){
			$.search_textfield.hide();
		});
	}
}
init();

/**
 * get configuration
 */
function getConfig() {

	Data.get_config(function(error, e) {
		if (!error) {
			Alloy.Globals.setBackdropImageSize(e.images.backdrop_sizes);
			Alloy.Globals.setPosterImageSize(e.images.poster_sizes);
		} else {
			// handle error
		}
	});
}

/**
 * get movie collections and populate
 */
function getLists() {

	Data.movies_get_lists(function(error, e) {
		if (!error) {
			lists = e;
			populateLists(lists, 'list', 0, cellOffset + Alloy.Globals.layout.lists.cell.height + 20);
			getGenres();
		} else {
			Ti.API.error("Error: " + JSON.stringify(JSON.parse(e), null, 4));
		}
	});
}

/**
 * get movie genres and populate
 * - animates in content once populated
 */
function getGenres() {

	Data.movies_get_genres(function(error, e) {
		if (!error) {
			genres = e;
			populateLists(genres, 'genre', lists.length, cellOffset + 40 + Alloy.Globals.layout.lists.cell.height);
			loaded_callback();
		} else {
			Ti.API.error("Error: " + JSON.stringify(JSON.parse(e), null, 4));
		}
	});
}

function configureStaticCells() {
	
	$.searchCell.updateViews({
		"#cell": {
			top: cellOffset,
			left: 10
		},
		"#title_label": {
			text: "\uf002"
		}
	});
	
	$.aboutCell.updateViews({
		"#cell": {
			top: cellOffset,
			left: 10 + (Alloy.Globals.layout.lists.cell.width + 10),
			height: (OS_IOS) ? ((Alloy.Globals.layout.lists.cell.height - 10) / 2) : Alloy.Globals.layout.lists.cell.height 
		},
		"#title_label": {
			text: "\uf129"
		}
	});
	
	if (OS_IOS) {
		$.settingsCell.updateViews({
			"#cell": {
				top: cellOffset + ((Alloy.Globals.layout.lists.cell.height - 10) / 2) + 10,
				left: 10 + (Alloy.Globals.layout.lists.cell.width + 10),
				height: ((Alloy.Globals.layout.lists.cell.height - 10) / 2)
			},
			"#title_label": {
				text: "\uf013"
			}
		});
	}
}

/**
 * populate lists
 */
function populateLists(lists, type, cellOffset, yOffset) {

	for (var i=0, num_lists=lists.length; i<num_lists; i++) {

		var list = lists[i];
		var idx = i + cellOffset;
		var cell_x = 10 + ((Alloy.Globals.layout.lists.cell.width + 10) * (idx % 2));
		var cell_y = yOffset + ((Alloy.Globals.layout.lists.cell.height + 10) * Math.floor(idx / 2));

		var cell = Alloy.createController("views/list_cell");
		cell.updateViews({
			"#cell": {
				top: cell_y,
				left: cell_x
			},
			"#title_label": {
				text: list.title.toUpperCase()
			}
		});

		var images = [];
		_.each(list.backdrop_paths, function(path) {
			if (path != null) {
				images.push(theMovieDb.common.getImage({
					size: Alloy.Globals.backdropImageSize,
					file: path}));
			}
		});
		images = _.chain(images).shuffle().first(5).value();
		cell.populateImages(images);

		(function(cell, index) {

			cell.getView().addEventListener("click", function(e) {

				$.lists_container.touchEnabled = false;

				cell.animateClick(function() {

					if (type == 'list') {
		    			openList(lists[index]);
		    		} else if (type == 'genre') {
		    			openGenre(genres[index]);
		    		}

		    		setTimeout(function() {
				    	$.lists_container.touchEnabled = true;
				    }, 1000);

	   			});
			});

		})(cell, i);

		cells.push(cell);
		$.lists_container.add(cell.getView());
		var contentHeight = cell_y + Alloy.Globals.layout.lists.cell.height + 10;
		if (OS_ANDROID) {
			contentHeight = Alloy.Globals.dpToPx(contentHeight);
		}
		$.lists_container.contentHeight = contentHeight;
	}
}	

function startAnimatingImages() {
	if (cells.length > 0 && !image_animation_interval) {
		image_animation_interval = setInterval(animateImages, 5000);
	}
}

function stopAnimatingImages() {
	clearInterval(image_animation_interval);
	image_animation_interval = null;
}

function animateImages() {
	_.each(cells, function(cell, index){
		setTimeout(function() {
			animateCellImages(cell);
		}, index*100);
	});
}

function animateCellImages(cell) {
	
	var cellTop = cell.getView().rect.y;
	var cellBottom = cell.getView().rect.y + cell.getView().rect.height;
	var visibleTop = $.lists_container.contentOffset.y;
	if (OS_ANDROID) {
		visibleTop = Alloy.Globals.pxToDp(visibleTop);
	}
	var visibleBottom = visibleTop + $.lists_container.rect.height;
	
	var isVisible = (cellTop < visibleBottom) && (cellBottom > visibleTop);
	
	if (isVisible) {
		cell.animateImages();
	}
}

/**
 * add cell separator line
 */
function addCellSeparator(offset) {
	var view = Ti.UI.createView({
		top: offset,
		left: 10,
		right: 10,
		height: 0.5,
		backgroundColor: '#b0332a'
	});
	$.lists_container.add(view);
}

/**
 * animate in view
 */
$.animateIn = function() {
	$.activity_indicator.hide();

	var offset = cellOffset + Alloy.Globals.layout.lists.cell.height;
	if (OS_ANDROID) {
		offset = Alloy.Globals.dpToPx(offset + 20);
	}
	$.lists_container.setContentOffset({x: 0, y: offset}, false);
	
	$.lists_container.animate(Ti.UI.createAnimation({
		opacity: 1,
		duration: 1000
	}));

	startAnimatingImages();

	Ti.Analytics.featureEvent('view:home');
};

/**
 * open list
 */
function openList(list) {
	Alloy.Globals.Navigator.push("movies_list",
	{
		type: 'list',
		id: list.id
	});
}

/**
 * open genre
 */
function openGenre(genre) {
	Alloy.Globals.Navigator.push("movies_list",
	{
		type: 'genre',
		id: genre.id
	});
}

/**
 * show overlay controller
 */
function showOverlay(controller, options) {
	overlay_controller = Alloy.createController(controller, options);
	var view = overlay_controller.getView();
	if (OS_IOS) view.transform = Ti.UI.create2DMatrix({scale: 2.0});
	$.window.add(view);

	var cells_animation = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix({scale: 0.7}),
		opacity: 0.5,
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		duration: 500
	});
	$.lists_container.animate(cells_animation);

	var view_animation = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix({scale: 1}),
		opacity: 1,
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		duration: 500,
		delay: 100
	});
	view.animate(view_animation);

	overlay_controller.getView().addEventListener("click", hideOverlay);

	displaying_overlay = true;

	if (OS_ANDROID) {
		android_back_event_listener = function(e) {
			hideOverlay();
		};

		$.window.addEventListener('androidback', android_back_event_listener);
	}
}

/**
 * hide overlay controller
 */
function hideOverlay() {

	var view = overlay_controller.getView();
	view.removeEventListener("click", hideOverlay);
	var view_animation = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix({scale: 2.0}),
		opacity: 0,
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		duration: 500
	});
	view.animate(view_animation);
	view_animation.addEventListener('complete', function(e) {
		$.window.remove(view);
		overlay_controller.destroy();
		overlay_controller = null;
	});

	var animation = Ti.UI.createAnimation({
		transform: Ti.UI.create2DMatrix({scale: 1.0}),
		opacity: 1,
		curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
		duration: 500,
		delay: 100
	});
	$.lists_container.animate(animation);

	displaying_overlay = false;

	if (OS_ANDROID) {
		$.window.removeEventListener('androidback', android_back_event_listener);
	}
}

function displaySearch() {
	if (OS_ANDROID) {
		$.search_textfield.show();
	}
	
	displaying_search = true;
	$.lists_container.scrollEnabled = false;
	$.lists_container.contentOffset = {x: 0, y: 0};
	$.search_overlay.zIndex = 101;
	$.search_textfield.focus();
	
	$.container.animate({
		top: 0,
		duration: 250
	});
}

/**
 * hide search and reset list scroll offset
 */
function hideSearch() {
	displaying_search = false;
	$.search_overlay.zIndex = 0;
	$.lists_container.scrollEnabled = true;
	$.search_textfield.blur();
	$.search_textfield.value = '';

	var animation = Ti.UI.createAnimation({
		top: -70,
		duration: 250
	});
	if (OS_ANDROID) {
		animation.addEventListener('complete', function(e){
			$.search_textfield.hide();	
		});
	}
	$.container.animate(animation);
}


///////////////////////////////////////////////////////////////////////////////
//
// event handlers
//
///////////////////////////////////////////////////////////////////////////////

/**
 * scrollview scroll event handler
 */
if (OS_IOS) {
	$.lists_container.addEventListener('scroll', function(e){
		var offset = e.y;
		$.navbar.background_view.opacity = Math.max(Math.min(offset / (cellOffset / 2), 1), 0);
	});
}

/**
 * search overlay click event handler
 */
$.search_overlay.addEventListener('click', function(e){
	hideSearch();
});

/**
 * search textfield return event handler
 */
$.search_textfield.addEventListener('return', function(e){
	Alloy.Globals.Navigator.push("movies_list", {
		type: 'search',
		query: e.value
	});

	setTimeout(function(){
		hideSearch();
	}, 1000);
});

$.searchCell.getView().addEventListener("click", function(e){
	$.lists_container.touchEnabled = false;
	$.searchCell.animateClick(function() {
		Ti.Analytics.featureEvent('display:search');
		displaySearch();
		setTimeout(function() {
	    	$.lists_container.touchEnabled = true;
	    }, 1000);

	});
});

function handleStaticCellClick(cell, overlay) {
	$.lists_container.touchEnabled = false;
	cell.animateClick(function() {
		Ti.Analytics.featureEvent('display:' + overlay);
		showOverlay(overlay);

		setTimeout(function() {
	    	$.lists_container.touchEnabled = true;
	    }, 1000);

	});
}

$.aboutCell.getView().addEventListener("click", function(e) {
	handleStaticCellClick($.aboutCell, 'about');
});

/**
 * iOS only: settings button click event handler
 */
if (OS_IOS) {
	$.settingsCell.getView().addEventListener("click", function(e) {
		handleStaticCellClick($.settingsCell, 'settings');
	});
}

/**
 *
 * iOS only: Core motion for list parallax effect
 *
 * - motion updates are listened for when property is set, app is active and window is visisble
 *
 */
if (OS_IOS) {

	Ti.App.addEventListener(Alloy.Globals.EVENT_PROPERTY_ENABLE_MOTION_ANIMATION_DID_CHANGE, registerForMotionUpdates);

	$.window.addEventListener('focus', function(e){
		startAnimatingImages();
		registerForMotionUpdates();
		Ti.App.addEventListener('resume', registerForMotionUpdates);
		Ti.App.addEventListener('pause', unregisterForMotionUpdates);
	});

	$.window.addEventListener('blur', function(e){
		stopAnimatingImages();
		unregisterForMotionUpdates();
		Ti.App.removeEventListener('resume', registerForMotionUpdates);
		Ti.App.removeEventListener('pause', unregisterForMotionUpdates);
	});

	function registerForMotionUpdates() {
		
		if (!Ti.App.Properties.getBool(Alloy.Globals.PROPERTY_ENABLE_MOTION_ANIMATION)) {
			unregisterForMotionUpdates();
			return;
		}

		if (CoreMotion.isDeviceMotionAvailable() && !CoreMotion.isDeviceMotionActive()) {
			CoreMotion.setDeviceMotionUpdateInterval(50);
			CoreMotion.startDeviceMotionUpdates(function(e) {
				if (e.success) {
					// Ti.API.info("picth: " + e.attitude.pitch);
					// Ti.API.info("roll: " + e.attitude.roll);
					// Ti.API.info("yaw: " + e.attitude.yaw);

					var imageTop = Alloy.Globals.layout.lists.cell.imageTop + (15 * e.attitude.pitch);
					var imageLeft = Alloy.Globals.layout.lists.cell.imageLeft + (15 * e.attitude.roll);

					for (var i=0, num_cells=cells.length; i<num_cells; i++) {

						var cell = cells[i];
						cell.updateViews({
							"#image": {
								top: imageTop,
								left: imageLeft
							}
						});
					}
				}
			});
		}
	}

	function unregisterForMotionUpdates() {
		if (CoreMotion.isDeviceMotionActive()) {
			CoreMotion.stopDeviceMotionUpdates();
		}
	}
}
