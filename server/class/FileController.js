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
        nameSafe = name.replace(/[^A-Za-z0-9\.]/gi, '_');

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
						" VALUES (?,?,?,?,?,?,?)", [nameSafe, isFolder, currentDate, currentDate, parentId, projectId, user.userId], 
						function(err2, row2){
							if(err2) {
								// TODO: Check kind of error -> code number
								msg.fromVal("project:file-created", {success: false, code: 1});
								log("Cannot insert file '" + nameSafe + "'", "err", "FileController.js");
								console.log(err2);
								socket.sendMessage(user.client, msg);
							}
							else {
								log("File '" + nameSafe + "' created on database.", "debug", "FileController.js");
                                var id = this.lastID;
								// Create file on drive
								controller.fileController.createFileOnDrive(projectId, parentId, nameSafe, isFolder, function() {
                                    log("Successful creating file on drive", "info", "FileController.js");
                                    // Send message
                                    msg.fromVal("project:file-created", {success: true, id: id, deletionDate: null, deletionUserId: null, editionUserId: null, creationDate: currentDate,lastEditionDate: currentDate, projectId: projectId, name: nameSafe, parentFolderId: parentId, isFolder: isFolder,permissionLevel: row.permissionLevel});
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
	
    this.getParentRecursively = function(parentId, fullPath, maxDepth, callback) {
        if(maxDepth > 20) {
            log("Max folder depth reached.", "err", "FileController.js");
            return;
        }

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
            maxDepth++;
            controller.fileController.getParentRecursively(row.parentId, fullPath, maxDepth, callback);
        });

    };
	
	// If parent id is project id -> then pass 0
    this.getFilePathFromParentId = function(parentId, callback) {
        if(parentId < 1) {
            callback("");
			return;
		}
        this.getParentRecursively(parentId, "", 0, callback);
    };
	
	this.getFileContent = function(client, fileId) {
		// Get user
		var user = controller.userController.getUser(client);
		
		// Get file info
		database.getSingle(
            " SELECT " + tables.file.fields.name + " as 'name', " + tables.file.fields.parentFolderId + " as 'parentId', " +
            tables.file.fields.projectId + " as 'projectId'" + 
			" FROM " + tables.file.name + 
            " WHERE " + tables.file.fields.id + " = ? ", [fileId],
            function(err, row) {
				if (err) {
					log("Failed to get file information", "err", "FileController.js");
                    console.log(err);                    
                }
                else {
					log("Successfully got file information", "debug", "FileController.js");
					// Get file path
					controller.fileController.getFilePathFromParentId(row.parentId, function(path) {
						// File path
						var filePath = user.userId + "_" + row.projectId + "/";
						filePath += path;
						filePath += row.name;
						
						// Check if content already exist in inner files array
						for (var i = 0; i < controller.fileController.files.length; i++) {
							if (controller.fileController.files[i].id == fileId) {
								var userFound = false;
								for (var j = 0; j < controller.fileController.files[i].userlist.length; j++) {
									if (controller.fileController.files[i].userlist[j] == user.userId)
										userFound = true;
								}
								
								if (!userFound)
									controller.fileController.files[i].userlist.push(user);
								var msg = new modules.classes.Message();
								msg.fromVal("editor:file-content", {success: true, content: controller.fileController.files[i].content, projectId: row.projectId});
								socket.sendMessage(user.client, msg);
								log("Sent content from files array", "debug", "FileController.js");
								return;
							}
						}
						
						// Read
						controller.fileController.fs.readFile(modules.config.paths.projects + filePath, "utf8", function(error, data) {
							if (error) {
								log("Failed to read file content!", "err", "FileController.js");
								console.log(error);
								
								// Send message
								var msg = new modules.classes.Message();
								msg.fromVal("editor:file-content", {success: false, content: "", projectId: row.projectId});
								socket.sendMessage(user.client, msg);
							}
							else {
								log("Successfully read file's content!", "debug", "FileController.js");
								
								// Send message
								var msg = new modules.classes.Message();
								controller.fileController.files.push({id: fileId, content: data, isModified: false, userlist: [user]});
								msg.fromVal("editor:file-content", {success: true, content: data, projectId: row.projectId});
								socket.sendMessage(user.client, msg);
							}
						});
					});
				}
		});		
	};
	
	this.addCharToFile = function(client, fileId, pos, value, line, ch) {
		for (var i = 0; i < controller.fileController.files.length; i++) {
			if (controller.fileController.files[i].id == fileId) {
				// Modifying content
				controller.fileController.files[i].content = controller.fileController.files[i].content.substr(0, pos) + value + controller.fileController.files[i].content.substr(pos, controller.fileController.files[i].content.length);
				controller.fileController.files[i].isModified = true;
				
				// Send message
				var msg = new modules.classes.Message();
				msg.fromVal("editor:add-content", {success: true, fileId: fileId, pos: pos, value: value, line: line, ch: ch});
				for (var j = 0; j < controller.fileController.files[i].userlist.length; j++) {
					if(controller.fileController.files[i].userlist[j].client != client)
						socket.sendMessage(controller.fileController.files[i].userlist[j].client, msg);					
				}
			}
		}
	};
	
	this.removeCharFromFile = function(client, fileId, pos, length, lineFrom, chFrom, lineTo, chTo) {
		for (var i = 0; i < controller.fileController.files.length; i++) {
			if (controller.fileController.files[i].id == fileId) {
				// Modifying content
				controller.fileController.files[i].content = controller.fileController.files[i].content.substr(0, pos) + controller.fileController.files[i].content.substr(pos + length, controller.fileController.files[i].content.length);
				controller.fileController.files[i].isModified = true;
				
				// Send message
				var msg = new modules.classes.Message();
				msg.fromVal("editor:remove-content", {success: true, fileId: fileId, pos: pos, length: length, lineFrom: lineFrom, chFrom: chFrom, lineTo: lineTo, chTo: chTo});
				for (var j = 0; j < controller.fileController.files[i].userlist.length; j++) {
					if(controller.fileController.files[i].userlist[j].client != client)
						socket.sendMessage(controller.fileController.files[i].userlist[j].client, msg);					
				}
			}
		}
	};
	
	this.saveFile = function() {
		for (var i = 0; i < controller.fileController.files.length; i++) {
			if (controller.fileController.files[i].isModified) {
				(function(file){
					controller.fileController.getFilePathFromFileId(file.id, function(filePath) {
						controller.fileController.fs.writeFile(filePath, "", function (clearErr) {
							if (clearErr) {
								log("Failed to clean file content", "err", "FileController.js");
							}
							else {
								controller.fileController.fs.writeFile(filePath, file.content, function (writeErr) {
									if (writeErr) {
										log("Failed to write file content", "err", "FileController.js");
									}
									else {
										file.isModified = false;
									}
								});								
							}
						});
					});
				})(controller.fileController.files[i]);
			}
		}
	};
	
	this.getFilePathFromFileId = function(fileId, callback) {
		// Get file info
		database.getSingle(
            " SELECT " + tables.file.fields.name + " as 'name', " + tables.file.fields.parentFolderId + " as 'parentId', " +
            tables.file.fields.projectId + " as 'projectId', " + tables.file.fields.creationUserId + " as 'creationUserId'" +
			" FROM " + tables.file.name + 
            " WHERE " + tables.file.fields.id + " = ? ", [fileId],
            function(err, row) {
				if (err || !row) {
					log("Failed to get file information", "err", "FileController.js");
                    console.log(err);                    
                }
                else {
					log("Successfully got file information", "debug", "FileController.js");
					// Get file path
					controller.fileController.getFilePathFromParentId(row.parentId, function(path) {
						// File path
						var filePath = modules.config.paths.projects + row.creationUserId + "_" + row.projectId + "/";
						filePath += path;
						filePath += row.name;
						
						callback(filePath);			
					});
				}
			});
	};
    
	this.rename = function(client, name, fileId) {
		// Get user
		var user = controller.userController.getUser(client);
		
		// Update
		database.getSingle(
			" SELECT " + tables.file.fields.name + " as 'name', " + tables.file.fields.parentFolderId + " as 'parentId', " +
			tables.file.fields.projectId + " as 'projectId'" + 
			" FROM " + tables.file.name + 
			" WHERE " + tables.file.fields.id + " = ? ", [fileId],
			function(selectErr, selectRow) {
				if (selectErr) {
					log("Failed to get file information", "err", "FileController.js");
					console.log(selectErr);
					var msg = new modules.classes.Message();
					msg.fromVal("project:renamed", {success: false});
					socket.sendMessage(client, msg);
				}
				else {
					log("Successfully got file information", "debug", "FileController.js");
									
					// Get file info
					database.execPrep(
						" UPDATE " + tables.file.name + 
						" SET " + tables.file.fields.name + " = ?" +
						" WHERE " + tables.file.fields.id + " = ?;", [name, fileId], 
						function(updateErr, updateRow) {
							if (updateErr) {
								log("Error at renaming file [id:" + fileId + "]", "err", "FileController.js");
								console.log(updateErr);                    
							}
							else {
								log("Successfully renamed file [id:" + fileId + "] into '" + name + "'", "debug", "FileController.js");
								
								// Get file path
								controller.fileController.getFilePathFromParentId(selectRow.parentId, function(path) {
									// File path
									var oldFile = modules.config.paths.projects + user.userId + "_" + selectRow.projectId + "/";
									oldFile += path;
									var newFile = oldFile + name;
									oldFile += selectRow.name;
									
									// Read
									controller.fileController.fs.rename(oldFile, modules.config.paths.projects + newFile, function (renameErr) {
										if (renameErr) {
											log("Failed to rename file", "err", "FileController.js");
											console.log(renameErr);    
										}
										else {
											log("Renamed file on drive successfully!", "debug", "FileController.js");
											var msg = new modules.classes.Message();
											msg.fromVal("project:renamed", {success: true, id: fileId, newName: name, isProject: false});
											socket.sendMessage(client, msg);
										}
									});
								});
							}
					});						
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
