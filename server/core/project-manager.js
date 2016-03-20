// projects.js (core) (server)
// ...

module.exports = function() {
    this.handleMessage = function(message, client) {
        switch(message.type) {
			case "get-projects":
				controller.projectController.getProjectList(client);
				break;
			case "get-all-users":
				controller.userController.getAllUsers(client);
				break;
            case "get-files":
				controller.fileController.getProjectFiles(client, message.data.projectId);
                // idProject
                // Return all files from a project
                // Check if user has access!
                break;
            case "delete-project":
                // idProject
                // Check if user is "project admin"
                break;
            case "add-project":
				controller.projectController.addProject(controller.userController.getUser(client), message.data.projectName, message.data.projectUsers, message.data.description);
                // check if user can add
                break;
            case "rename-project":
                // projectId, name
                // check if user is project admin, + does not already exist
                break;
            case "add-file":
               // console.log(controller.fileController.createFile());
                controller.fileController.createFile(client, message.data.projectId, message.data.parentId, message.data.name, message.data.isFolder);
                // fileName, projectId, parentId, isFolder
                // Check if user has access!
                break;
            case "remove-file":
                // fileId
                 // Check if user has access!
                break;
            case "rename-file":
                // fileId, name
                // Check if user has access + if doesn't exists
                break;
            case "move-file":
                // fileId, parentId
                // Check if user has access + if doesn't exists, + still on the same project
                break;
            default:
                log(message.type + " is not a valid type", "debug", "project-manager.js");
                break;
		}
    }
}