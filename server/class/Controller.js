/*
CLASS: Controller
DESCRIPTION: Is the unique handler for every users and projects
*/

module.exports = function(userController, fileController, projectController) {
	// Attributes
	this.userController = userController;
    userController.init();
    
	this.fileController = fileController;
    this.fileController.init();
	this.projectController = projectController;
    projectController.init();
	
	// Methods
	this.init = function() {
		setInterval(controller.fileController.saveFile, modules.config.global.saveTime);		
	};
};
