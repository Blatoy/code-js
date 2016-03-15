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
		user = controller.userController.getUser(client);
		database.getArray("SELECT * FROM " + tables.relUserProject.name + " WHERE " + tables.user.fields.userId + " = ?", user.userId, function(err, row) {
			if (err) {
				log("Error getting projets of user '" + user.username + "'", "err", "ProjectController.js");
				var msg = new modules.classes.Message();
				msg.fromVal("project:project-list", null)
				socket.sendMessage(user.client, msg);
			}
			else {
				log("Successfully got projects of user '" + user.username + "'", "debug", "ProjectController.js");
				var msg = new modules.classes.Message();
				msg.fromVal("project:project-list", {projectId: row[0].ProjectID, permissionLevel: row[0].PermissionLevel, userColor: row[0].UserColor});
				socket.sendMessage(user.client, msg);
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
