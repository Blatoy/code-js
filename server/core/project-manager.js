// projects.js (core) (server)
// ...

module.exports = function() {
    this.handleMessage = function(message, client) {
        switch(message.type) {
			case "get-projects":
				controller.projecController.getProjectList(client);
				break;
		}
    }
}