var projectManager = function() {
	this.init = function() {
		var msg = new Message();
		msg.fromVal("project:get-projects", undefined);
		modules.socket.sendMessage(msg);
	};
	
	this.displayProjects = function(data) {
		if(data.length == 0) {
			$("#file-content").text("There's nothing here.");
		}
		else {
			$("#file-content").html("<div class='file'>"+data[0].projectId+"</div>");
		}
	};
	
	this.handleMessage = function(message) {
		switch(message.type) {
			case "project-list":
				this.displayProjects(message.data);
				break;
		}
	};
}