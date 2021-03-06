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
        if(modules.config.global.signupEnabled) {
            var msg = new modules.classes.Message();
            msg.fromVal("login:enable-signin", "");
            socket.sendMessage(client, msg);
        }
        var msg = new modules.classes.Message();
        msg.fromVal("login:server-name", modules.config.global.serverName);
        socket.sendMessage(client, msg);
	};
	    
	this.login = function(userInformation, client) {
        var user = this.getUser(client);
        /*if(user.isConnected); {
            log("Login attempt failed (" + userInformation.username + ")", "warn", "UserController.js");
            return;
        }*/

		// Get user info
        database.getSingle(
            " SELECT * FROM " + tables.user.name + 
            " WHERE " + tables.user.fields.username + " = ?", [userInformation.username], 
            function(err, row) {
                var loggedSuccessful = false;
                var msg = new modules.classes.Message();
                
                if(row) {
                    if(row[tables.user.fields.pass] == userInformation.pass) {
                        controller.userController.initUser(user, row);
                        loggedSuccessful = true;
                        msg.fromVal("login:login-attempt", {userId: user.userId, username: user.username, avatarURL: user.avatarURL, 
						inscriptionDate: user.inscriptionDate, lastConnection: user.lastConnection, success: true});
                        log("Login attempt successful (" + userInformation.username + ")", "info", "UserController.js");
                    }
                }
                
                if(!loggedSuccessful) {
					msg.fromVal("login:login-attempt", {success: false});
                    log("Login attempt failed (" + userInformation.username + ")", "warn", "UserController.js");
                }

                socket.sendMessage(client, msg);
            }
        );
	};
	
	this.createAccount = function(userInformation, client) {
		var msg = new modules.classes.Message();
		if(!modules.config.global.signupEnabled)
            return;
        
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
	
	this.getClientByUserId = function(userId) {
		for (var i = 0; i < this.users.length; i++) {
			if (this.users[i].userId == userId)
				return this.users[i].client;
		}
	};
	
	this.getUserByClientId = function(clientId) {
		for (var i = 0; i < this.users.length; i++) {
			if (this.users[i].clientId == clientId)
				return this.users[i];
		}
	};
	
	this.getAllUsers = function(client) {
		database.getArray(
            " SELECT " + tables.user.fields.username + " as 'username', " +
             tables.user.fields.avatarURL + " as 'avatarURL', " + 
             tables.user.fields.userId + " as 'userId' " + 
            " FROM " + tables.user.name, [],
            function(err, row) {
				if (err)
					log("Failed to get all users.", "err", "UserController.js");

                if (row) {
					var data = [];
					var msg = new modules.classes.Message();
                    
					for (var i = 0; i < row.length; i++) {
						data.push({username: row[i].username, avatarURL: row[i].avatarURL, userId:row[i].userId});
					}
					log("Success at getting all users.", "debug", "UserController.js");
					
					if (client != null) {
						msg.fromVal("project:all-users", data);
						socket.sendMessage(client, msg);
					}
					else {
						return data;
					}
                }
            }
        );
	};
	
	this.initUser = function(user, row) {
        user.userId = row[tables.user.fields.userId];
        user.username = row[tables.user.fields.username];
        user.avatarURL = row[tables.user.fields.avatarURL];
		user.inscriptionDate = row[tables.user.fields.inscriptionDate];
		user.lastConnection = new Date().getTime();
        user.isConnected = true;
		
		database.execPrep(
			" UPDATE " + tables.user.name + 
			" SET " + tables.user.fields.lastConnection + " = ?" +
			" WHERE " + tables.user.fields.userId + " = ?", [user.lastConnection, user.userId], 
			function(err){
				if(!err) {
					log("Inserted last connection date: " + user.username, "debug", "UserController.js");
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
    
    this.getHistory = function(client) {
        var user = this.getUser(client);
        database.getSingle(
            " SELECT " + tables.file.fields.name + " as 'fileName', " +
             tables.file.fields.creationDate + " as 'creationDate', " + 
             tables.project.fields.name + " as 'projectName' " +
            " FROM " + tables.file.name + " LEFT JOIN " + tables.project.name + " ON " +
             tables.file.fields.projectId + " = " + tables.project.fields.id +
            " WHERE " + tables.file.fields.creationUserId + " = ? " + 
            " ORDER BY " + tables.file.fields.creationDate + " DESC;", [user.id],
            function(err, row) {
				if (err)
					log("Failed to get user history.", "err", "UserController.js");

                if (row) {
					var data = [];
					var msg = new modules.classes.Message();
                    
					data.push({fileName: row.fileName, creationDate: row.creationDate, projectName: row.projectName});
                    
					log("Success got user history", "debug", "UserController.js");
					
					if (client != null) {
						msg.fromVal("user-history", data);
						socket.sendMessage(client, msg);
					}
					else {
						return data;
					}
                }
            }
        );
    }
};
