
var Login = function(){
	this.init = function() {
		$("#login-button").on("click", this.login);
		$("#login-sign-up").on("click", this.toggleSignUp);
		$("#repeat-password-area").toggle();
        $("#login-username, #login-password").on("keyup", function(e){
            if($("#login-username").val().length > 2 && $("#login-password").val().length > 2)
                $("#login-button").prop("disabled", false);
            else
                $("#login-button").prop("disabled", true);
            if(e.keyCode == 13 && !$("#login-button").prop("disabled"))
                $("#login-button").click();
        })
	}
	
	this.login = function() {
		// changePage("project-manager");
        var msg = new Message();
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
