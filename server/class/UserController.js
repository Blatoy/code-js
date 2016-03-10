// UserController.js (class) (server)
// Is the unique handler for users and websocket clients

module.exports = function() {
	// Attributes
	this.users = [];
	var userCount = 0;
	
	// Methods
	this.init = function() {};
	
	this.createClient = function(client) {
		this.users.push(new modules.classes.User(client, userCount++));
		log("New connection (CID: " + userCount + ")", "info", "UserController.js");
	};
	
	this.login = function(userInformation, client) {
		// log("Login attempt with username: " + user.username, "info", "UserController.js");
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
                        user.userId = row[tables.user.fields.userId];
                        user.username = row[tables.user.fields.username];
                        msg.fromVal("login-attempt", true);
                        log("Login attempt successful (" + userInformation.username + ")", "info", "UserController.js");
                    }
                }
                
                if(!loggedSuccessful) {
                    msg.fromVal("login-attempt", false);
                    log("Login attempt failed (" + userInformation.username + ")", "warn", "UserController.js");
                }

                socket.sendMessage(client, msg);
            }
        );
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
	};
    
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
	
	this.initUser = function(user) {
		
	};
	
	this.removeUser = function(user) {
		/*user.disconnect();
		user.client.close();*/
		users.splice(users.indexOf(user), 1);
	};
	
	this.getUsernameById = function(userId) {
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
	};	
};
