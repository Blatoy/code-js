/*
CLASS: Controller
DESCRIPTION: Is the unique handler for every users and projects
*/

module.exports = function(userController, fileController, projectController) {
	// Attributes
	this.userController = userController;
    userController.init();
    
	this.fileController = fileController;
	this.projectController = projectController;
    projectController.init();
	
	// Methods
	this.init = function() {};
};
