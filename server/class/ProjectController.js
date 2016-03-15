/*
CLASS: Project Controller
DESCRIPTION: Is the unique handler for projects
*/

module.exports = function() {
	// Attributes
	this.projects = [];
	this.fs;
	
	// Methods
	this.init = function() {
		this.fs = require('fs');
	};
	
	this.getProjectList = function(client) {
		database.getArray("SELECT * FROM " + tables.relUserProject.name + " WHERE " + tables.user.fields.userId + " = ?", client.userId, function(err, row) {
			if (err) {
				log("Error getting projets of user '" + client.username + "'", "err", "ProjectController.js");
				user.projects = [null];
			}
			else {
				log("Successfully got projects of user '" + client.username + "'", "info", "ProjectController.js");
				user.projects = row;
			}
		});
	};
	
	this.createFolder = function(folderName) {
		this.fs.mkdir(modules.config.paths["projects"] + folderName, function(err) {
			if (err)
				log("Error creating " + folderName, "err", "ProjectController.js");
			else 
				log("Created " + folderName + " successfully!", "info", "ProjectController.js");
		});
	};
};
