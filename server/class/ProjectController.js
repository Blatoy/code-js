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
		database.getArray(" SELECT p." + tables.project.fields.name + " as 'projectName', p." + tables.project.fields.lastEditionDate + " as 'lastEditDate', p." + 
										 tables.relUserProject.fields.projectId + " as 'projectId', p." + tables.relUserProject.fields.permissionLevel + 
										 " as 'permissionLevel', p." + tables.relUserProject.fields.userColor + " as 'userColor', n." + tables.project.fields.isFolder + " as 'isFolder'" +
						  " FROM n " + tables.project.name + 
						  " LEFT JOIN p " + tables.relUserProject.name + 
						  " ON " + "n." + tables.project.projectId + " = " + "p." + tables.relUserProject.projectId + 
						  " WHERE p." + tables.relUserProject.fields.userId + " = ?", user.userId, function(err, row) {
			if (err) {
				log("Error getting projets of user '" + user.username + "'", "err", "ProjectController.js");
				var msg = new modules.classes.Message();
				msg.fromVal("project:project-list", null)
				socket.sendMessage(user.client, msg);
			}
			else {
				log("Successfully got projects of user '" + user.username + "'", "debug", "ProjectController.js");
				var data = [];
				var msg = new modules.classes.Message();
				for (var i = 0; i < row.length; i++) {
					data.push({projectName: row[i].projectName, lastEditDate: row[i].lastEditDate, isFolder: row[i].isFolder, projectId: row[i].projectId, permissionLevel: row[i].permissionLevel, userColor: row[i].userColor});
				}
				msg.fromVal("project:project-list", data);
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
