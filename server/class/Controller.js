/*
CLASS: Controller
DESCRIPTION: Is the unique handler for every users and projects
*/

module.exports = function(userController, fileController, projectController) {
	// Attributes
	this.userController = userController;
	this.fileController = fileController;
	this.projectController = projectController;
	
	// Methods
	this.init = function() {};
};
