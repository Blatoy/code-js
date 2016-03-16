var Connecting = function(){
	this.init = function() {
		$("#connect-button").on("click", this.connect);
		$("#selectIP").focus();
        $("#selectIP").select();
        $("#selectIP").val(CONFIG_SERVER["DEFAULT_IP"]);
 
		$("#selectIP").on("keyup", function(e){
			if(e.keyCode == 13)
				$("#connect-button").click();
		});
        
        if(CONFIG_GLOBAL.debugEnabled) {
            $("#selectIP").val(CONFIG_GLOBAL.debugServer);
            $("#connect-button").click();
        }
    };
	
	this.connect = function() {
		CONFIG_SERVER["DEFAULT_IP"] = $("#selectIP").val();

		modules.socket = new Socket();
		modules.socket.init();
		modules.socket.ws.onmessage = function(msg){modules.socket.handleMessage(msg)};
		setInterval(function(){modules.socket.handleStateChange()}, 50);
		modules.connecting.displayConnecting();
		// $("#connect-area").hide();
		// $("#server-connection").show();
	};
	
	this.displayError = function() {
        /*$("#connection-text").css("color", "red");
        $("#connection-image").addClass("dead");
        $("#connection-image").removeClass("loading");
        $("#connection-text").removeClass("blinking");
        */
        if(!modules.socket.hasConnectionSucceed)
            $("#connection-information").text("Cannot reach the server.");
        else
            $("#connection-information").text("Connection lost.");
            
        $("#selectIP").prop("disabled", false);
        $("#connect-button").prop("disabled", false);
        $("#connection-information").removeClass("blinking");
        $("#connection-information").css("color", "red");
	};

	this.displayConnecting = function() {
        /*$("#connection-text").css("color", "green");
        $("#connection-image").removeClass("dead");
        $("#connection-image").addClass("rotating");
        $("#connection-image").addClass("loading");
        $("#connection-text").addClass("blinking");*/
       // $("#connect-button").val("Connecting...");
        $("#connect-button").prop("disabled", true);
        $("#selectIP").prop("disabled", true);
        $("#connection-information").css("color", "#666");
        $("#connection-information").html("Connecting...");
        $("#connection-information").addClass("blinking");
	}
	
    // Handle sockets messages
    this.handleMessage = function(message) {
        
    };
};