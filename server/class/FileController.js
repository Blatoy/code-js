/*
CLASS: File Controller
DESCRIPTION: Is the unique handler for files
*/

module.exports = function() {
	// Attributes
	this.files = [];
	this.fs;
	
	// Methods
	this.init = function() {
		this.fs = require('fs');
	};
	
	this.getProjectFiles = function(projectId) {
		
	}
	
	this.createFile = function(fileName) {
		this.fs.writeFile(modules.config.paths["projects"] + fileName, "", function(err) {
			if (err)
				log("Error creating file", "err", "FileController.js");
			else
				log("Successful creating file", "info", "FileController.js");
		});
	};
};
