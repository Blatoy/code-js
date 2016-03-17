// projects.js (core) (server)
// ...

module.exports = function() {
    this.handleMessage = function(message, client) {
        switch(message.type) {
			case "get-projects":
				controller.projectController.getProjectList(client);
				break;
            case "get-files":
                // idProject
                // Return all files from a project
                // Check if user has access!
                break;
            case "delete-project":
                // idProject
                // Check if user is "project admin"
                break;
            case "add-project":
                // projectName, projectUsers[], description
                // check if user can add
                break;
            case "rename-project":
                // projectId, name
                // check if user is project admin, + does not already exist
                break;
            case "add-file":
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