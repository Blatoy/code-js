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
        log("["+ controller.userController.getUser(client).getDebugName() +"] ["+message.type+"] " + JSON.stringify(message.data), "debug", "Socket.js");
        var messageType = message.type.split(":");
        message.type = messageType[1];
         
		switch (messageType[0]) {
			case "login":
                cores.login.handleMessage(message, client);
				break;
            case "global":
                switch(message.type) {
                    case "pong":
                        controller.userController.getUser(client).handlePong();
                        break;
                }
                break;
		}
	}
	
	this.sendMessage = function(client, message) {
		try {
			client.send(JSON.stringify({type: message.type, data: message.data}));
		} catch (e) {}
	};
	
	this.broadcast = function() {
	};
};