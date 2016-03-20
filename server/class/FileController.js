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
	
	this.getProjectFiles = function(client, projectId) {
		database.getArray(
            " SELECT " + tables.file.fields.id + " as 'id', " + tables.file.fields.name + " as 'name', " +
			tables.file.fields.isFolder + " as 'isFolder', " + tables.file.fields.isDeleted + " as 'isDeleted', " +
			tables.file.fields.projectId + " as 'projectId', " + tables.file.fields.isDeleted + " as 'isDeleted', " +
			tables.file.fields.creationDate + " as 'creationDate', " + tables.file.fields.lastEditionDate + " as 'lastEditionDate', " + 
			tables.file.fields.deletionDate + " as 'deletionDate', " + tables.file.fields.parentFolderId + " as 'parentFolderId', " +
			tables.file.fields.creationUserId + " as 'creationUserId', " + tables.file.fields.editionUserId + " as 'editionUserId', " + 
			tables.file.fields.deletionUserId + " as 'deletionUserId' FROM " + tables.file.name +
			" WHERE " + tables.file.fields.projectId + " = ?", [projectId],
            function(err, row) {
				if (err) {
					log("Failed to project's files!", "err", "FileController.js");
                    console.log(err);
				}
                if (row) {
					var data = [];
					var msg = new modules.classes.Message();
					for (var i = 0; i < row.length; i++) {
						data.push({id: row[i].id, name: row[i].name, isFolder: row[i].isFolder, isDeleted: row[i].isDeleted,
								   creationDate: row[i].creationDate, lastEditionDate: row[i].lastEditionDate, deletionDate: row[i].deletionDate,
								   parentFolderId: row[i].parentFolderId, creationUserId: row[i].creationUserId, editionUserId: row[i].editionUserId,
								   deletionUserId: row[i].deletionUserId, projectId: row[i].projectId});
					}
                    // log("Success at getting all project's files!", "debug", "FileController.js");
					
					if (client != null) {
						msg.fromVal("project:file-list", data);
						socket.sendMessage(client, msg);
					}
					else {
						return data;
					}
                }
            }
        );
	};
	
	this.createFile = function(client, projectId, parentId, name, isFolder) {
        var currentDate = (new Date()).getTime();
        var user = controller.userController.getUser(client);
        var msg = new modules.classes.Message();

		// Get permission level
		database.getSingle(
            " SELECT " + tables.relUserProject.fields.permissionLevel + " as 'permissionLevel' " +
            " FROM " + tables.relUserProject.name + 
            " WHERE " + tables.relUserProject.fields.userId + " = ? ", [user.userId],
            function(err, row) {
				if (err) {
					log("Failed to get project permission level", "err", "FileController.js");
                    console.log(err);                    
                }
                else {
                   // Add file
					database.execPrep(
						" INSERT INTO file (Name, IsFolder, CreationDate, LastEditionDate, ParentFolderID, ProjectID, CreationUserID)" + 
						" VALUES (?,?,?,?,?,?,?)", [name, isFolder, currentDate, currentDate, parentId, projectId, user.userId], 
						function(err2, row2){
							if(err2) {
								// TODO: Check kind of error -> code number
								msg.fromVal("project:file-created", {success: false, code: 1});
								log("Cannot insert file '" + name + "'", "err", "FileController.js");
								console.log(err2);
								socket.sendMessage(user.client, msg);
							}
							else {
								log("File '" + name + "' created on database.", "debug", "FileController.js");
                                var id = this.lastID;
								// Create file on drive
								controller.fileController.createFileOnDrive(projectId, parentId, name, isFolder, function() {
                                    log("Successful creating file on drive", "info", "FileController.js");
                                    // Send message
                                    msg.fromVal("project:file-created", {success: true, id: id, deletionDate: null, deletionUserId: null, editionUserId: null, creationDate: currentDate,lastEditionDate: currentDate, projectId: projectId, name: name, parentFolderId: parentId, isFolder: isFolder,permissionLevel: row.permissionLevel});
                                    socket.sendMessage(user.client, msg);																									
								});
							}
						}
					);
				}
            }
        );
        
        // TODO: Check rights
        
		

       // database.execPrep("INSERT
    };
	
    this.getParentRecursively = function(parentId, fullPath, callback) {
        if(parentId == 0) {
            callback(fullPath);
            return;
        }

        database.getSingle("SELECT " + tables.file.fields.name + " as name, " + tables.file.fields.parentFolderId + " as parentId FROM " + tables.file.name + " WHERE " + tables.file.fields.id + " = ?", [parentId], function(err, row){
            if(!row) {
                callback(fullPath);
                return;
            }
            
            fullPath += row.name + "/";
            controller.fileController.getParentRecursively(row.parentId, fullPath, callback);
        });

    };
	
    this.getFilePathFromParentId = function(parentId, callback) {
        if(parentId == 0)
            callback("");
        this.getParentRecursively(parentId, "", callback);
    };
    
	this.rename = function(client, name, fileId) {
		database.execPrep(
			" UPDATE " + tables.file.name + 
			" SET " + tables.file.fields.name + " = ?" +
			" WHERE " + tables.file.fields.id + " = ?;", [name, fileId], 
			function(err, row) {
				if (err) {
					log("Error at renaming file [id:" + fileId + "]", "err", "FileController.js");
					console.log(err);
					var msg = new modules.classes.Message();
					msg.fromVal("project:renamed", {success: false});
					socket.sendMessage(client, msg);
				}
				else {
					log("Successfully renamed file [id:" + fileId + "] into '" + name + "'", "info", "FileController.js");
					var msg = new modules.classes.Message();
					msg.fromVal("project:renamed", {success: true, id: fileId, newName: name, isProject: false});
					socket.sendMessage(client, msg);
				}
			}
		);
	};
    
	this.createFileOnDrive = function(projectId, parentFolder, fileName, isFolder, callback) {
        database.getSingle(
            "SELECT " + tables.project.fields.creationUserId + " as creatorId FROM " + tables.project.name + " WHERE " + tables.project.fields.id + " = ?", [projectId], 
            function(err, row){
                if(!err) {
                    controller.fileController.getFilePathFromParentId(parentFolder, function(path) {
                        if(isFolder)
                            controller.fileController.fs.mkdir(modules.config.paths["projects"] + row.creatorId + "_" + projectId + "/" +  path + fileName, function(err, row){});
                        else
                            controller.fileController.fs.writeFile(modules.config.paths["projects"] + row.creatorId + "_" + projectId + "/" +  path + fileName, "", function(err, row){});
                        callback();
                    });
                }
                else {
                    log("Cannot get user ID", "err", "FileController.js");
                }
            }
        );
	};    
};
