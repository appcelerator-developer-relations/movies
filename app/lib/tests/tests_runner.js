
// mocha
require('tests/ti-mocha');
mocha.setup({reporter: 'ti-spec-studio'});

// specs
var require_path = 'tests/specs/';
var specs_dir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + require_path);
var spec_files = specs_dir.getDirectoryListing();
for (var i=0; i<spec_files.length; i++) { 
	require(require_path + spec_files[i].replace('.js', ''));
}

// run
Ti.API.info("\n\n==============================\nRunning logic tests\n==============================\n\n");
mocha.run(function(){
	Ti.API.info("\n\n==============================\nCompleted logic tests\n==============================\n\n\n ");
	Ti.App.fireEvent("logic_tests_complete");
});

