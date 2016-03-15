var projectManager = function() {
	this.init = function() {
		var msg = new Message();
		msg.fromVal("get-projects", undefined);
		modules.socket.sendMessage(msg);
	};
}