// login.js (core) (client)
// Handle all login related things

var Login = function(){
	this.init = function() {
		$("#login-button").on("click", this.login);
        // Temporary line
        this.login();
		$("#login-sign-up").on("click", this.toggleSignUp);
		$("#repeat-password-area").toggle();
        $("#login-username").focus();
        $("#signup-area").hide();
        
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
        
        if(CONFIG_GLOBAL.debugEnabled) {
            $("#login-username").val(CONFIG_GLOBAL.debugUser);
            $("#login-password").val(CONFIG_GLOBAL.debugPass);
            $("#login-button").click();
        }        
	};
	
	this.login = function() {
        var msg = new Message();
		if($("#repeat-password-area").is(':visible'))
			msg.fromVal("login:create-account", {pass: $("#login-password").val(), username: $("#login-username").val()});
		else
			// msg.fromVal("login:login", {pass: $("#login-password").val(), username: $("#login-username").val()});
            msg.fromVal("login:login", {pass: "cool", username: "McMichael"});
		modules.socket.sendMessage(msg);
	};
	
    this.handleLoginAttempt = function(data) {
        if(data.success) {
            selfUser = data;
            changePage("project-manager", function(){
				modules.projectManager = new projectManager();
				modules.projectManager.init();
			});
        }
        else {
            $("#login-password").val("");
            $("#login-password").focus();
            $("#login-password").prop("placeholder", "Password incorrect");
        }
    };
    
    this.handleInscriptionAttempt = function(data) {
        if(data.success) {
            this.toggleSignUp();
            $("#login-button").click();
        }
        else {
            $("#login-username").val("");
            $("#login-username").focus();
            
            switch(data.code) {
                case 1:
                    // Username already in use
                    $("#login-username").prop("placeholder", "Username already in use");
                    break;
                case 2:
                    // Invalid data
                    $("#login-username").prop("placeholder", "Invalid data");
                    $("#login-password-repeat").val("");
                    $("#login-password-repeat").val("");
                    break;
            }
        }
    };
    
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
	};
    
    this.displaySignIn = function() {
        // Wait for the page to load
        setTimeout(function(){
            if($("#signup-area").length)
                $("#signup-area").show();
            else
                modules.login.displaySignIn();
        }, 50);
    };

    this.displayServerName = function(name) {
        // Wait for the page to load
        setTimeout(function(){
            if($("#server-name").length)
                $("#server-name").text(name);
            else
                modules.login.displayServerName(name);
        }, 50);
    };
    
    // Handle sockets messages
    this.handleMessage = function(message) {
        switch(message.type) {
            case "login-attempt":
                modules.login.handleLoginAttempt(message.data);
                break;
            case "inscription-status":
                modules.login.handleInscriptionAttempt(message.data);
                break;
            case "enable-signin":
                this.displaySignIn();
                break;
            case "server-name":
                this.displayServerName(message.data);
                break;
        }
    };
};
