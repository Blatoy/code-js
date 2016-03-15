// Socket.js (class) (client)
// Handle sockets related things

var Socket = function() {
	this.ws;
	this.lastReadyState = -1;
    this.hasConnectionSucceed = false;
    this.isConnected = false;
    
	this.init = function() {
		this.ws = new WebSocket("ws://" + CONFIG_SERVER["DEFAULT_IP"] + ":" + CONFIG_SERVER["DEFAULT_PORT"]);
	};
	
	this.handleStateChange = function() {
		if(!this.ws || this.lastReadyState == this.ws.readyState)
			return;

		switch(this.ws.readyState) {
			case 0:
				break;
			case 1:
                this.isConnected = true;
                this.hasConnectionSucceed = true;
				changePage("login", function(){
					modules.login = new Login();
					modules.login.init();
				});
				break;
			case 3:
                this.isConnected = false;
				changePage("connecting", function(){
					modules.connecting.displayError();
				});
				break;
		}
		
		this.lastReadyState = this.ws.readyState;
    };
	
	this.handleMessage = function(message) {
		var msg = new Message();
        msg.fromJSON(message.data);

        
        var messageType = msg.type.split(":");
        msg.type = messageType[1];
         
		if(msg.type != "ping")
			console.log(msg);
		
		switch (messageType[0]) {
			case "login":
                modules.login.handleMessage(msg);
				break;
            case "connecting":
                modules.connecting.handleMessage(msg);
                break;
			case "project":
                modules.projectManager.handleMessage(msg);
                break;
            case "global":
                switch(msg.type) {
                    case "ping":
                        var message = new Message();
                        message.fromVal("global:pong", "pong")
                        this.sendMessage(message);
                        break;
                }
                break;
		}
	};
	
	this.sendMessage = function(message) {
		if(message.type != "global:pong")
			console.log(message);
		this.ws.send(JSON.stringify({data:message.data, type:message.type}));
	};
}
