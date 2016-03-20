/*
CLASS: Project Controller
DESCRIPTION: Is the unique handler for projects
*/

module.exports = function() {
	// Attributes
	this.projects = [];
	this.fs = {};
	
	// Methods
	this.init = function() {
		this.fs = require('fs');
	};
	
	this.addProject = function(user, projectName, projectUsers, description) { 
		// If Description is empty -> set it to ""
		if (!description)
			description = "";
		
        if(projectName.length < 3)
            return;
        
		// Useful global variables
		var date = new Date().getTime();
		var data;
		var isProjectAdded = false;
		var addedProjectId;
        var msg = new modules.classes.Message();
        
        this.getProjectId(projectName, user.userId, function(id){
            if(id != -1) {
                msg.fromVal("project:add-project-status", {success: false, code:0});
                socket.sendMessage(user.client, msg);
                return;
            }
            // Add project to database
            database.execPrep(
                " INSERT INTO " + tables.project.name + " (" + 
                tables.project.fields.name + ", " + 
                tables.project.fields.description + ", " + 
                tables.project.fields.creationDate + ", " + 
                tables.project.fields.creationUserId + ")" + 
                " VALUES (?,?,?,?)", [projectName, description, date, user.userId], function(err){
                    if(!err) {
                        isProjectAdded = true;

                        // Get project id
                        controller.projectController.getProjectId(projectName, user.userId, function(createdProjectId){
                            // Create project on drive
                            controller.projectController.createProjectOnDrive(user.userId, createdProjectId);
                            
                            // Add relation between the users and the project
                            projectUsers.push({userId: user.userId, permissionLevel: 4});

                            // TODO: Check if the user exist
                            for (var i = 0; i < projectUsers.length; i++) {
                                (function(user){
                                    database.execPrep(
                                        " INSERT INTO " + tables.relUserProject.name + 
                                        " (" + 
                                            tables.relUserProject.fields.userId + ", " + 
                                            tables.relUserProject.fields.projectId + ", " + 
                                            tables.relUserProject.fields.permissionLevel + ", " + 
                                            tables.relUserProject.fields.userColor + 
                                        ")" + 
                                        " VALUES (?,?,?,?)", [user.userId, createdProjectId, user.permissionLevel, '#'+Math.floor(Math.random()*16777215).toString(16)], function(err){
                                            if(!err) {
                                                // Todo: notify users
                                                socket.sendMessage(user.client, msg);
                                                log("Successfully added user to project " + projectName + "!", "debug", "ProjectController.js");
                                            }
                                            else {
                                                log("Could not add user to project " + projectName + "!", "err", "ProjectController.js");
                                                console.log(err);
                                            }
                                });}(projectUsers[i]));
                            }
                            
                            data = {success: true, projectName: projectName, projectUsers: projectUsers, creationDate: date, creator: user.userId, projectId: createdProjectId};
                            msg.fromVal("project:add-project-status", data);
                            socket.sendMessage(user.client, msg);
                        });
                    }
                    else {
                        msg.fromVal("project:add-project-status", {success: false, code:1});
                        socket.sendMessage(user.client, msg);
                        log("Could not create project " + projectName + "!", "err", "ProjectController.js");
                    }
                    
                }
            );
        });
	};
	
	this.getProjectId = function(projectName, creationUserId, callback) {
		database.getSingle(
            " SELECT " + tables.project.fields.id + " as 'projectId' " +
            " FROM " + tables.project.name + 
            " WHERE " + tables.project.fields.name + " = ? " +
            " AND " + tables.project.fields.creationUserId + " = ?", [projectName, creationUserId],
            function(err, row) {
				if (err) {
					log("Failed to get project id", "err", "ProjectController.js");
                    console.log(err);
                    callback(-1);
                }
                else if (row)
                   callback(row.projectId);
                else
                    callback(-1);
            }
        );
	};
	
	this.getProjectList = function(client) {
		user = controller.userController.getUser(client);
		database.getArray(" SELECT n." + tables.project.fields.name + " as 'projectName', p." + 
										 tables.relUserProject.fields.projectId + " as 'projectId', p." + tables.relUserProject.fields.permissionLevel + 
										 " as 'permissionLevel', p." + tables.relUserProject.fields.userColor + " as 'userColor'" +
						  " FROM " + tables.project.name + " n " + 
						  " LEFT JOIN " + tables.relUserProject.name + " p " +
						  " ON " + "n." + tables.project.fields.id + " = " + "p." + tables.relUserProject.fields.projectId + 
						  " WHERE p." + tables.relUserProject.fields.userId + " = ?", [user.userId], 
            function(err, row) {
                if (err) {
                    log("Error getting projets of user '" + user.username + "'", "err", "ProjectController.js");
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
            }
        );
	};

    this.removeFile = function() {};
    
    this.renameFile = function() {};
    
    this.createProject = function(){};
    
	this.createProjectOnDrive = function(creatorId, projectId) {
        // console.log(controller.projectController);
        var folderName = modules.config.paths["projects"] + creatorId + "_" + projectId;
		controller.projectController.fs.mkdir(folderName, function(err) {
			if (err)
				log("Cannot create the folder " + folderName, "err", "ProjectController.js");
			else 
				log("Created the folder " + folderName + " successfully!", "debug", "ProjectController.js");
		});
	};
};
