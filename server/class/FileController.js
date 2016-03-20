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
					// too much useless output
                    if(data.length != 0)
                        console.log(data);
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
        var currentDate = new Date().getTime();
        var user = controller.userController.getUser(client);
		var msg = new Message();
		
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
								msg.fromVal("project:file-created", {success: true, fileName: name, permissionLevel: row.permissionLevel});
								log("File '" + name + "' created", "debug", "FileController.js");
								
								// Create file on drive
								this.createFileOnDrive(projectId, parentId, name, function(err3, row3) {
									if (err3)
										log("Error creating file on drive", "err", "FileController.js");
									else {
										log("Successful creating file on drive", "info", "FileController.js");
										// Send message
										socket.sendMessage(user.client, msg);										
									}																	
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
	
	// TODO: GET FILE IN TREE!!!
	this.createFileOnDrive = function(projectId, parentFolder, fileName, callback) {
		this.fs.writeFile(modules.config.paths["projects"] + fileName, "", function(err, row){});
	};
    
};
