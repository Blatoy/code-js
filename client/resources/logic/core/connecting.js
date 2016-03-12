var Connecting = function(){
	this.init = function() {
        $("#connection-retry").hide();
    };
	
	this.displayError = function() {
        console.log(modules.socket.hasConnectionSucceed);
        $("#connection-text").css("color", "red");
        $("#connection-image").addClass("dead");
        $("#connection-image").removeClass("loading");
        $("#connection-text").removeClass("blinking");
        $("#connection-retry").show();
        
        if(!modules.socket.hasConnectionSucceed)
            $("#connection-text").text("Cannot reach the server");
        else
            $("#connection-text").text("Connection lost");

	};

    // Handle sockets messages
    this.handleMessage = function(message) {
        
    };
};