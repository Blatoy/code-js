// UserController.js (class) (server)
// Is the unique handler for users and websocket clients

module.exports = function() {
	// Attributes
	this.users = [];
	var userCount = 0;
	
	// Methods
	this.init = function() {
        setInterval(this.pingAllUser, modules.config.global.pingInterval);
    };
	
	this.createClient = function(client) {
		this.users.push(new modules.classes.User(client, userCount++));
		log("New connection (CID: " + userCount + ")", "info", "UserController.js");
	};
	
    
	this.login = function(userInformation, client) {
        var user = this.getUser(client);
        
        database.getSingle(
            " SELECT * FROM " + tables.user.name + 
            " WHERE " + tables.user.fields.username + " = ?", [userInformation.username], 
            function(err, row) {
                var loggedSuccessful = false;
                var msg = new modules.classes.Message();
                
                if(row) {
                    if(row[tables.user.fields.pass] == userInformation.pass) {
                        loggedSuccessful = true;
                        controller.userController.initUser(user, row);
                        msg.fromVal("login:login-attempt", true);
                        log("Login attempt successful (" + userInformation.username + ")", "info", "UserController.js");
                    }
                }
                
                if(!loggedSuccessful) {
                    msg.fromVal("login:login-attempt", false);
                    log("Login attempt failed (" + userInformation.username + ")", "warn", "UserController.js");
                }

                socket.sendMessage(client, msg);
            }
        );
	};
	
	this.createAccount = function(userInformation, client) {
		var msg = new modules.classes.Message();
		
		if(userInformation.pass.length > 2 && userInformation.username.length > 2) {
			database.execPrep(
				" INSERT INTO " + tables.user.name + 
				" (" + tables.user.fields.username + ", " + tables.user.fields.pass + "," + tables.user.fields.inscriptionDate + ")" + 
				" VALUES (?,?,?)", [userInformation.username, userInformation.pass, new Date().getTime()], 
				function(err){
					if(!err) {
						msg.fromVal("login:inscription-status", {success:true, code:0});
						socket.sendMessage(client, msg);
						log("New user inscription with username: " + userInformation.username, "info", "UserController.js");
					}
                    else {
                        msg.fromVal("login:inscription-status", {success:false, code:1});
                        socket.sendMessage(client, msg);
                        log("User inscription failed (data error) with username: " + userInformation.username, "err", "UserController.js");
                    }
				});
		}
		else {
			msg.fromVal("login:inscription-status", {success:true, code:2});
			socket.sendMessage(client, msg);
			log("User inscription failed (spam) with username: " + userInformation.username, "err", "UserController.js");
		}
			
	};
    
    this.pingAllUser = function() {
        for(var i = 0; i < controller.userController.users.length; i++) {
            controller.userController.users[i].ping();
        }
    }
    
	this.getUser = function(client) {
		for (var i = 0; i < this.users.length; i++) {
			if (this.users[i].client == client)
				return this.users[i];
		}
	};
	
	this.getUserByClientId = function(clientId) {
		for (var i = 0; i < this.users.length; i++) {
			if (this.users[i].clientId == clientId)
				return this.users[i];
		}
	}
	
	this.initUser = function(user, row) {
        user.userId = row[tables.user.fields.userId];
        user.username = row[tables.user.fields.username];
        user.avatarURL = row[tables.user.fields.avatarURL];
		user.lastConnection = new Date().getTime();
        user.isConnected = true;
		
		database.execPrep(
			" UPDATE " + tables.user.name + 
			" SET " + tables.user.fields.lastConnection + " = ?" +
			" WHERE " + tables.user.fields.userId + " = ?", [user.lastConnection, user.userId], 
			function(err){
				if(!err) {
					log("Inserted last connection date: " + user.username, "info", "UserController.js");
				}
				else {
					log("Failed insertion of last connection date: " + user.username, "err", "UserController.js");
				}
			}
		);
	};
	
	this.removeUser = function(user) {
		/*user.disconnect();
		user.client.close();*/
		this.users.splice(this.users.indexOf(user), 1);
	};
};
