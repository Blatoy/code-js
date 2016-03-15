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
			for(var i = 0; i++; i < data.length) {
				var imageType = "folder";
				$("#file-content").html('<div class="file">' + 
					'<span class="file-icon"><img src="resources/ui/images/folder.png" alt="' + folder + '-image"/></span>' + 
					'<span class="file-title">' + data.projectName + '</span>' + 
					'<span class="file-last-modification">' + data.lastModification + '</span>' + 
					'<span class="file-working-people">' + Math.round(Math.random() * 20) + '</span>' + 
				'</div>');
			}
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