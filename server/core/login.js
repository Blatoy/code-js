// login.js (core) (server)
// handle messages from the login (client) page.

module.exports = function() {
    this.handleMessage = function(message, client) {
        switch(message.type) {
            case "login":
                controller.userController.login(message.data, client);
                break;
			case "create-account":
                controller.userController.createAccount(message.data, client);
				break;
        }
    }
}