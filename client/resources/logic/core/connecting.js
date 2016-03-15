var Connecting = function(){
	this.init = function() {
		$("#connect-button").on("click", this.connect);
		$("#selectIP").on("keyup", function(e){
			if(e.keyCode == 13)
				$("#connect-button").click();
		});
		
    };
	
	this.connect = function() {
		CONFIG_SERVER["DEFAULT_IP"] = $("#selectIP").val();
		modules.socket = new Socket();
		modules.socket.init();
		modules.socket.ws.onmessage = function(msg){modules.socket.handleMessage(msg)};
		setInterval(function(){modules.socket.handleStateChange()}, 50);
		modules.connecting.displayConnecting();
		$("#connect-area").hide();
		$("#server-connection").show();
	};
	
	this.displayError = function() {
        console.log(modules.socket.hasConnectionSucceed);
        $("#connection-text").css("color", "red");
        $("#connection-image").addClass("dead");
        $("#connection-image").removeClass("loading");
        $("#connection-text").removeClass("blinking");
        
        if(!modules.socket.hasConnectionSucceed)
            $("#connection-text").text("Cannot reach the server");
        else
            $("#connection-text").text("Connection lost");

	};

	this.displayConnecting = function() {
        $("#connection-text").css("color", "green");
        $("#connection-image").removeClass("dead");
        $("#connection-image").addClass("rotating");
        $("#connection-image").addClass("loading");
        $("#connection-text").addClass("blinking");
	}
	
    // Handle sockets messages
    this.handleMessage = function(message) {
        
    };
};