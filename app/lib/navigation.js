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

/**
 * Standard, native navigation (ActionBar for Android and NavigationWindow for iOS)
 *
 * This is a simple example of handling opening new windows in a cross platform
 * fashion.  If you want to manage the stack yourself, do things like close all
 * windows, etc. Reference some of the other examples on managing your own
 * stack of views or windows.
 *
 * @class Navigation
 */

/**
 * The Navigation object
 * @param {Object} _args
 * @param {Object} _args.parent The parent which this navigation stack will belong
 * @constructor
 */
function Navigation(_args) {
    var that = this;

    _args = _args || {};

    /**
     * The parent navigation window (iOS only)
     * @type {Object}
     */
    this.parent = _args.parent;
    
    this.controllers = [],
    this.currentController = null;
    this.currentControllerArguments = {};

    /**
     * Open a screen controller
     * @param {String} _controller
     * @param {Object} _controllerArguments The arguments for the controller (optional)
     * @return {Controllers} Returns the new controller
     */
    this.push = function(_controller, _controllerArguments) {
    	if (typeof _controller == "string") {
        	var controller = Alloy.createController(_controller, _controllerArguments);
       	} else {
			var controller = _controller;
		}
        that.currentController = controller;
        that.currentControllerArguments = _controllerArguments;
		that.controllers.push(controller);
		 
        if(OS_IOS) {
            that.parent.openWindow(controller.window);
        } else {
            controller.window.open();
        }

        return controller;
    },
    
    this.pop = function() {
    	
    	var controller = that.controllers.pop();
    	var window = controller.window;
    	
    	if(OS_IOS) {
            that.parent.closeWindow(window);
       } else {
       		window.close();
       }
       
       controller.destroy();
    },
    
    this.openModal = function(_controller, _controllerArguments) {
        var controller = Alloy.createController(_controller, _controllerArguments);
        that.currentController = controller;
        that.currentControllerArguments = _controllerArguments;

        if(OS_IOS) {
            controller.window.open({
                modal : true,
                animated: false
            });
        } else {
            controller.window.addEventListener('open', function(e) {
                that.setActionBarStyle(controller.window);
            });
            controller.window.open();
        }

        return controller;
    },
    
    this.closeModal = function(_controller) {
        
        if(OS_IOS) {
            _controller.window.close();
            _controller.window = null;
        } else {
            _controller.window.close();
            _controller.window = null;
        }

        _controller.destroy();
        _controller = null;
    };

}

// Calling this module function returns a new navigation instance
module.exports = function(_args) {
    return new Navigation(_args);
};