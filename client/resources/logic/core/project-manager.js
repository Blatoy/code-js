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
			$("#file-content").html("");
			for(var i = 0; i < data.length; i++) {
				var imageType = data[i].isFolder ? "folder" : "file";
				$("#file-content").append('<div class="file">' + 
					'<span class="file-icon"><img src="resources/ui/images/folder.png" alt="' + imageType + '-image"/></span>' + 
					'<span class="file-title">' + data[i].projectName + '</span>' + 
					'<span class="file-last-modification">Jamais</span>' + 
					'<span class="file-working-people">' + Math.round(Math.random() * 20) + '</span>' + 
				'</div>');
			}
			$("#file-history").html("");
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