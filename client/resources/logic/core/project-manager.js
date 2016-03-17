var projectManager = function() {
    // Create context menu
    var createContextMenu = new ContextMenu();
    var manageContextMenu = new ContextMenu();
    
	this.init = function() {
        // Get the project list
        // TODO: Store the projects
		var msg = new Message();
		msg.fromVal("project:get-projects", undefined);
		modules.socket.sendMessage(msg);
        
        // Add context menu items
        createContextMenu.addItem("New file", function(){$("#file-content").append($("#file-content").html())});
        createContextMenu.addItem("New project", function(){});
        
        // TODO: Check on how to get the item ID
        manageContextMenu.addItem("Rename", function(){});
        manageContextMenu.addItem("Move", function(){});
        manageContextMenu.addItem("Delete", function(){});
        
        // Display all context menu
        $("#file-content").on("contextmenu", function(e){
            e.preventDefault();
            e.stopPropagation();
            createContextMenu.display(mouse.x, mouse.y);
        });
        
        $("#tool-box-new-file").on("click", function(e) {
            // Prevent instant closing
            setTimeout(function(){
                createContextMenu.display(mouse.x, mouse.y);
            }, 1);
        });
	};
	
	this.displayProjects = function(data) {
		if(data.length == 0) {
			$("#file-content").text("There's nothing here.");
		}
		else {
			$("#file-content").html("");
			for(var i = 0; i < data.length; i++) {
				var imageType = data[i].isFolder ? "folder" : "file";
                
                var element = $("<div>");
                element.addClass("file");
                element.html(
					'<span class="file-icon"><img src="resources/ui/images/folder.png" alt="' + imageType + '-image"/></span>' + 
					'<span class="file-title">' + data[i].projectName + '</span>' + 
					'<span class="file-last-modification">Jamais</span>' + 
					'<span class="file-working-people">' + Math.round(Math.random() * 20) + '</span>'
                );
                
                element.on("contextmenu", function(e) {
                    e.preventDefault();
                    manageContextMenu.display(mouse.x, mouse.y);
                });
                
                $("#file-content").append(element);
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