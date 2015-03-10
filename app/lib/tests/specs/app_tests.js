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

var should = require('tests/should');

describe('Layout (iPhone 4 inch)', function() {
    
    var layout = Alloy.Globals.calculateElementDimensions({width: 360, height: 568});
    
    it("Should have correct overlay dimensions", function() {
    	layout.overlay.width.should.equal(320);
	});
	
	it("Should have correct lists user cell dimensions", function() {
    	layout.lists.userCell.width.should.equal(340);
    	layout.lists.userCell.imageLeft.should.be.approximately(-56.7, 0.1);
    	layout.lists.userCell.imageWidth.should.be.approximately(453.3, 0.1);
    	layout.lists.userCell.imageHeight.should.be.approximately(254.9, 0.1);
    });
    
    it("Should have correct lists cell dimensions", function() {	
    	layout.lists.cell.width.should.equal(165);
    	layout.lists.cell.height.should.equal(165);
    	layout.lists.cell.imageTop.should.equal(-20);
    	layout.lists.cell.imageLeft.should.equal(-165);
    	layout.lists.cell.imageWidth.should.equal(495);
    	layout.lists.cell.imageHeight.should.be.approximately(278.4, 0.1);
	});
	
});

describe('Layout (Nexus 5)', function() {
    
    var layout = Alloy.Globals.calculateElementDimensions({width: 338, height: 690});
    
    it("Should have correct overlay dimensions", function() {
    	layout.overlay.width.should.equal(298);
	});
	
	it("Should have correct lists user cell dimensions", function() {
    	layout.lists.userCell.width.should.equal(318);
    	layout.lists.userCell.imageLeft.should.equal(-53);
    	layout.lists.userCell.imageWidth.should.equal(424);
    	layout.lists.userCell.imageHeight.should.equal(238.5);
  	});
  	
  	it("Should have correct lists cell dimensions", function() {
    	layout.lists.cell.width.should.equal(154);
    	layout.lists.cell.height.should.equal(154);
    	layout.lists.cell.imageTop.should.equal(-20);
    	layout.lists.cell.imageLeft.should.equal(-154);
    	layout.lists.cell.imageWidth.should.equal(462);
    	layout.lists.cell.imageHeight.should.be.approximately(259.9, 0.1);
	});
});
