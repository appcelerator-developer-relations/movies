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

var _introController;
var _homeController;

var launch = true;
if (!ENV_PRODUCTION) {
	if (Alloy.CFG.run_logic_tests) {
		launch = false;
		Ti.App.addEventListener("logic_tests_complete", function logicTestsComplete() {
			Ti.App.removeEventListener("logic_tests_complete", logicTestsComplete);
			init();
		});
	}
}
if (launch) {
	init();
}


/**
 * Init
 */
function init() {
	
	// App.init();
	
	_introController = Alloy.createController('intro');
	_introController.window.open();
	
	_homeController = Alloy.createController('home', {
		loaded_callback: function(){
			_introController.endIntro(displayHome);
	}});
}

/**
 * Display home screen
 */
function displayHome() {
	
	if (OS_IOS) {
		var navWindow = Ti.UI.iOS.createNavigationWindow({
			window: _homeController.window
		});
	    Alloy.Globals.navigationWindow = navWindow;
	    Alloy.Globals.initNavigation();
	    Alloy.Globals.navigationWindow.open();
	} else {
		Alloy.Globals.initNavigation();
		Alloy.Globals.Navigator.push(_homeController);
	}
	
	_homeController.animateIn();
	
	_introController.window.close();
	_introController = null;
}
