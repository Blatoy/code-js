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
	
	this.addProject = function(creator, projectName, projectUsers, description) { 
		// If Description is empty -> set it to ""
		if (!description)
			description = "";
		
		// Useful global variables
		var date = new Date().getTime();
		var data;
		var isProjectAdded;
		
		// Add project to database
		database.execPrep(
			" INSERT INTO " + tables.project.name + 
			" (" + tables.project.fields.name + ", " + tables.project.fields.description + ", " + tables.project.fields.creationDate + 
			", " + tables.project.fields.creationUserId + ")" + 
			" VALUES (?,?,?,?)", [projectName, description, date, creator.userId], function(err){
				if(!err) {
					isProjectAdded = true;
					data = {success: isProjectAdded, projectName: projectName, projectUsers: projectUsers, creationDate: date, creator: creator.userId};
					msg.fromVal("project:add-project", data);
					socket.sendMessage(client, msg);
					log("Successfully created project " + projectName + "!", "info", "ProjectController.js");
				}
				else {
					isProjectAdded = false;
					msg.fromVal("project:add-project", {success: isProjectAdded});
					socket.sendMessage(client, msg);
					log("Could not create project " + projectName + "!", "info", "ProjectController.js");
				}
		});
		
		// 
		if (isProjectAdded) {
			for (var i = 0; i < projectUsers[0].length; i++) {
				database.execPrep(
					" INSERT INTO " + tables.relUserProject.name + 
					" (" + tables.relUserProject.fields.userId + ", " + tables.relUserProject.fields.projectId + ", " + tables.relUserProject.fields.permissionLevel + 
					", " + tables.relUserProject.fields.userColor + ")" + 
					" VALUES (?,?,?,?)", [projectUsers[0][i].userId, /* projectId */, projectUsers[1][i], '#'+Math.floor(Math.random()*16777215).toString(16)], function(err){
						if(!err) {
							msg.fromVal("project:add-project", data);
							socket.sendMessage(controller.userController.getClientByUserId(projectUsers[0][i].userId), msg);
							log("Successfully added user to project " + projectName + "!", "info", "ProjectController.js");
						}
						else {
							msg.fromVal("project:add-project", {success: false});
							socket.sendMessage(controller.userController.getClientByUserId(projectUsers[0][i].userId), msg);
							log("Could not add user to project " + projectName + "!", "info", "ProjectController.js");
						}
				});
			}
		}
	};
	
	this.getProjectList = function(client) {
		user = controller.userController.getUser(client);
		database.getArray(" SELECT n." + tables.project.fields.name + " as 'projectName', p." + 
										 tables.relUserProject.fields.projectId + " as 'projectId', p." + tables.relUserProject.fields.permissionLevel + 
										 " as 'permissionLevel', p." + tables.relUserProject.fields.userColor + " as 'userColor'" +
						  " FROM " + tables.project.name + " n " + 
						  " LEFT JOIN " + tables.relUserProject.name + " p " +
						  " ON " + "n." + tables.project.fields.id + " = " + "p." + tables.relUserProject.fields.projectId + 
						  " WHERE p." + tables.relUserProject.fields.userId + " = ?", [user.userId], function(err, row) {
			if (err) {
				log("Error getting projets of user '" + user.username + "'", "err", "ProjectController.js");
				console.log(err);
				var msg = new modules.classes.Message();
				msg.fromVal("project:project-list", []);
				socket.sendMessage(user.client, msg);
			}
			else {
				log("Successfully got projects of user '" + user.username + "'", "debug", "ProjectController.js");
				var data = [];
				var msg = new modules.classes.Message();
				for (var i = 0; i < row.length; i++) {
					data.push({projectName: row[i].projectName, lastEditDate: row[i].lastEditDate, projectId: row[i].projectId, permissionLevel: row[i].permissionLevel, userColor: row[i].userColor});
				}
				msg.fromVal("project:project-list", data);
				socket.sendMessage(user.client, msg);
			}
		});
	};
	
    this.createFile = function() {};
    
    this.removeFile = function() {};
    
    this.renameFile = function() {};
    
    this.createProject = function(){};
    
	this.createFolder = function(folderName) {
		this.fs.mkdir(modules.config.paths["projects"] + folderName, function(err) {
			if (err)
				log("Error creating " + folderName, "err", "ProjectController.js");
			else 
				log("Created " + folderName + " successfully!", "info", "ProjectController.js");
		});
	};
};
