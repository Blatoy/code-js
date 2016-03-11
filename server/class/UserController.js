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
            " SELECT " + tables.user.fields.pass + ", " + tables.user.fields.userId + ", " + tables.user.fields.username + 
            " FROM " + tables.user.name + 
            " WHERE " + tables.user.fields.username + " = ?", [userInformation.username], 
            function(err, row){
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
						msg.fromVal("login:inscription-status", true);
						socket.sendMessage(client, msg);
						log("New user inscription with username: " + userInformation.username, "info", "UserController.js");
					}
                    else {
                        msg.fromVal("login:inscription-status", false);
                        socket.sendMessage(client, msg);
                        log("User inscription failed (data error) with username: " + userInformation.username, "err", "UserController.js");
                    }
				});
		}
		else {
			msg.fromVal("login:inscription-status", false);
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
        user.isConnected = true;
	};
	
	this.removeUser = function(user) {
		/*user.disconnect();
		user.client.close();*/
		this.users.splice(this.users.indexOf(user), 1);
	};
	
    /*this.database.queryPrep("SELECT " + this.tables.user.fields.pass + ", " + this.tables.user.fields.userId + " FROM " + this.tables.user.name + " WHERE " + this.tables.user.fields.username + " = ?", [user.name], function(err, row) {
        if (err) 
            console.log(err);
        else {
            console.log(row);
            if (user.pass == row[0]) {
                var d = new Date();
                this.database.update(tables.user.fields, [tables.user.fields.lastConnection], [d.getTime()], tables.user.fields.name, user.name);
                this.getUserByClientId(user.clientId).init(this, row[1]);
            }
        }
    });*/
    
	/*this.getUsernameById = function(userId) {
		this.database.queryPrep("SELECT " + this.tables.user.fields.username + " FROM " + this.tables.user.name + " WHERE " + this.tables.user.fields.userId + " = ?", [userId], function(err, row) {
			if (err) 
				console.log(err);
			else {
				console.log(row[0]);
				return row[0];
			}
		});
	};
	
	this.getLastConnectionById = function(userId) {
		this.database.queryPrep("SELECT " + this.tables.user.fields.lastConnection + " FROM " + this.tables.user.name + " WHERE " + this.tables.user.fields.userId + " = ?", [userId], function(err, row) {
			if (err) 
				console.log(err);
			else {
				console.log(row[0]);
				return row[0];
			}
		});
	};*/
};
