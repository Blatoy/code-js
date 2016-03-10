// User.js (class) (server)
// Is a user on CodeJS, extends a NodeJS client

module.exports = function(client, clientId) {
	// Defined for every user
	this.clientId = clientId;
	this.client = client;
    
    this.userPing;
    this.lastPing;
    this.pingIntervalId = -1;
    this.isConnected = false;
	this.userId;
	this.username;
	this.lastConnection;
	this.lastModified; // ()
	this.projects = [];
	this.contacts = [];
    
	// Methods
	this.init = function(client, userId) {};
    
    this.getDebugName = function() {
        if(this.username)
            return this.username;
        else
            return " CID: " + this.clientId;
    };
    
    this.handlePong = function() {
        this.userPing = new Date().getTime() - this.lastPing;
        clearInterval(this.pingIntervalId);
        this.pingIntervalId = -1;
    };
    
    this.ping = function() {
        this.lastPing = new Date().getTime();
        var msg = new modules.classes.Message();
        msg.fromVal("global:ping", "ping");

        socket.sendMessage(this.client, msg);
        if(this.pingIntervalId == -1) {
            (function(user){
                user.pingIntervalId = setInterval(function(){
                    log(user.getDebugName() + " timed out", "err", "User.js");
                    user.disconnect();
                }, modules.config.global.pingMax);
            }(this));
        }
    };
    
	this.disconnect = function() {};
	this.remove = function() {};
	this.changePassword = function() {};
	this.updateLastConnectionDate = function() {};
};