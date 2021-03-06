// Socket.js (class) (server)
// Handle everything related to sockets

module.exports = function() {
	// Attributes
	this.ws;
	this.clients = [];
	
	// Methods
	this.init = function(portNumber) {
		var WebSocket = require('./../resources/node_modules/ws').Server;
		this.ws = new WebSocket({port: portNumber});
		log("Websocket created", "debug", "Socket.js");
	};
	
	this.handleMessage = function(message, client) {
		try {
			if (message.type != "global:pong") 
				log(pad("["+ controller.userController.getUser(client).getDebugName() +"]", 10) + "["+message.type+"] " + JSON.stringify(message.data), "debug", "Socket.js");
			var messageType = message.type.split(":");
			message.type = messageType[1];
			 
			switch (messageType[0]) {
				case "login":
					cores.login.handleMessage(message, client);
					break;
				case "project":
					cores.projectManager.handleMessage(message, client);
					break;
				case "global":
					switch(message.type) {
						case "pong":
							controller.userController.getUser(client).handlePong();
							break;
					}
					break;
				case "editor":
					cores.editor.handleMessage(message, client);
					break;
			}
		} catch (e) {}
	};
	
	this.sendMessage = function(client, message) {
		try {
			client.send(JSON.stringify({type: message.type, data: message.data}));
		} catch (e) {}
	};
	
	/*
	this.broadcastByProjectID = function(users, projectId) {		
		// Send message
		for (var i = 0; i < users.length; i++) {
			if (users.)
			try {
				client.send(JSON.stringify({type: message.type, data: message.data}));
			} catch (e) {}
		}
	};*/
	
	this.broadcast = function() {
	};
};