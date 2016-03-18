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
			tables.file.fields.creationDate + " as 'creationDate', " + tables.file.fields.lastEditionDate + " as 'lastEditionDate', " + 
			tables.file.fields.deletionDate + " as 'deletionDate', " + tables.file.fields.parentFolderId + " as 'parentFolderId', " +
			tables.file.fields.creationUserId + " as 'creationUserId', " + tables.file.fields.editionUserId + " as 'editionUserId', " + 
			tables.file.fields.deletionUserId + " as 'deletionUserId' FROM " + tables.file.name +
			" WHERE " + tables.file.fields.projectId + " = ?", [projectId],
            function(err, row) {
				if (err) {
					log("Failed to project's files!", "err", "FileController.js");
				}
                if (row) {
					var data = [];
					var msg = new modules.classes.Message();
					for (var i = 0; i < row.length; i++) {
						data.push({id: row[i].id, name: row[i].name, isFolder: row[i].isFolder, isDeleted: row[i].isDeleted,
								   creationDate: row[i].creationDate, lastEditionDate: row[i].lastEditionDate, deletionDate: row[i].deletionDate,
								   parentFolderId: row[i].parentFolderId, creationUserId: row[i].creationUserId, editionUserId: row[i].editionUserId,
								   deletionUserId: row[i].deletionUserId});
					}
					log("Success at getting all project's files!", "debug", "FileController.js");
					
					if (client != null) {
						msg.fromVal("project:get-files", data);
						socket.sendMessage(client, msg);
					}
					else {
						return data;
					}
                }
            }
        );
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
