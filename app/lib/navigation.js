/**
 * Movies
 *
 * @copyright
 * Copyright (c) 2015-present by Appcelerator, Inc. All Rights Reserved.
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
 * @param {Object} _args The arguments passed to the navigation window
 * @param {Object} _args.parent The parent which this navigation stack will belong
 * @constructor
 */
function Navigation(_args) {
  this.parent = (_args || {}).parent;
  this.controllers = [];
  this.currentController = null;
  this.currentControllerArguments = {};
}

/**
 * Open a screen controller
 * @param {String} _controller The controller to push
 * @param {Object} _controllerArguments The arguments for the controller (optional)
 * @return {Array<Object>} Returns the new controller
 */
Navigation.prototype.push = function (_controller, _controllerArguments) {
  let controller;

  if (typeof _controller === 'string') {
    controller = Alloy.createController('/' + _controller, _controllerArguments);
  } else {
    controller = _controller;
  }
  this.currentController = controller;
  this.currentControllerArguments = _controllerArguments;
  this.controllers.push(controller);

  if (OS_IOS) {
    this.parent.openWindow(controller.window);
  } else {
    controller.window.open();
  }

  return controller;
};

Navigation.prototype.pop = function () {
  var controller = this.controllers.pop();
  var window = controller.window;

  if (OS_IOS) {
    this.parent.closeWindow(window);
  } else {
    window.close();
  }

  controller.destroy();
};

Navigation.prototype.openModal = function (_controller, _controllerArguments) {
  var controller = Alloy.createController('/' + _controller, _controllerArguments);
  this.currentController = controller;
  this.currentControllerArguments = _controllerArguments;

  if (OS_IOS) {
    controller.window.open({
      modal: true,
      animated: false
    });
  } else {
    const that = this;
    controller.window.addEventListener('open', function () {
      that.setActionBarStyle(controller.window);
    });
    controller.window.open();
  }

  return controller;
};

Navigation.prototype.closeModal = function (_controller) {
  if (OS_IOS) {
    _controller.window.close();
    _controller.window = null;
  } else {
    _controller.window.close();
    _controller.window = null;
  }

  _controller.destroy();
  _controller = null;
};

// Calling this module function returns a new navigation instance
module.exports = function (_args) {
  return new Navigation(_args);
};
