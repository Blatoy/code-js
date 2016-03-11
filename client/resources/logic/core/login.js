// login.js (core) (client)
// Handle all login related things
var Login = function(){
	this.init = function() {
		$("#login-button").on("click", this.login);
		$("#login-sign-up").on("click", this.toggleSignUp);
		$("#repeat-password-area").toggle();
        $("#login-username, #login-password, #login-password-repeat").on("keyup", function(e){
			var disableButton = true;
			if($("#repeat-password-area").is(':visible')) {
				if($("#login-password").val() == $("#login-password-repeat").val() && $("#login-password").val().length > 2)
					disableButton = false;
				else
					disableButton = true;
			}
			else {
				if($("#login-username").val().length > 2 && $("#login-password").val().length > 2)
					disableButton = false;
				else
					disableButton = true;
			}

			$("#login-button").prop("disabled", disableButton);
            if(e.keyCode == 13 && !disableButton)
                $("#login-button").click();
        });
	}
	
	this.login = function() {
        var msg = new Message();
		if($("#repeat-password-area").is(':visible'))
			msg.fromVal("login:create-account", {pass: $("#login-password").val(), username: $("#login-username").val()});
		else
			msg.fromVal("login:login", {pass: $("#login-password").val(), username: $("#login-username").val()});
			modules.socket.sendMessage(msg);
	}
	
    this.displayAttemptResult = function(success) {
        if(success) {
            changePage("project-manager");
        }
        else {
            $("#login-password").val("");
            $("#login-password").focus();
            $("#login-password").prop("placeholder", "Password incorrect");
        }
    }
    
	this.toggleSignUp = function() {
		$("#login-button").prop("disabled", true);
		$("#repeat-password-area").toggle();
		if($("#repeat-password-area").is(':visible')) {
			$("#login-button").val("Sign up");
			$("#login-sign-up").text("Log in");
		}
		else {
			$("#login-button").val("Log in");
			$("#login-sign-up").text("Sign up");
		}
	}
    
    // Handle sockets messages
    this.handleMessage = function(message) {
        switch(message.type) {
            case "login-attempt":
                modules.login.displayAttemptResult(message.data);
                break;
        }
    };
};
