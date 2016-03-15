/*
CLASS: File
DESCRIPTION: Represents a file in CodeJS
*/

module.exports = function() {
	// Attributes
	this.name;
	this.id;
	this.parentId;
	this.projectId;
	this.creationUserId;
	this.deletionUserId;
	this.lastModification;
	this.currentUsers = [];
	this.creationDate;
	this.deletionDate;
	this.isFolder;
	this.isDeleted;
	this.filePath;
	
	// Methods
	this.getCurrentUsers = function() {
	};
	this.addCurrentUser = function(User) {
	};
	this.removeCurrentUser = function(User) {
	};
	this.updateLastModifDate = function() {
	};
	this.rename = function(name) {
	};
	this.edit = function() {
	};
};