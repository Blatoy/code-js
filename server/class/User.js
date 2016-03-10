// User.js (class) (server)
// Is a user on CodeJS, extends a NodeJS client

module.exports = function(client, clientId) {
	// Defined for every user
	this.clientId = clientId;
	this.client = client;
    
	this.userId;
	this.username;
	this.lastConnection;
	this.lastModified; // ()
	this.projects = [];
	this.contacts = [];
	
	// Methods
	this.init = function(client, userId) {
        
		// this.userId = userId;
		/*this.username = controller.userController.getUsernameById(this.userId);
		this.lasConnection = userController.getLastConnectionById(this.userId);*/
	}
	
	this.disconnect = function() {
		
	};
	
	this.remove = function() {};
	this.changePassword = function() {};
	this.updateLastConnectionDate = function() {};
};