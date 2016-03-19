var projectManager = function() {
    // Create context menu
    this.currentPath = [];
    var createContextMenu = new ContextMenu();
    var manageContextMenu = new ContextMenu();
    var createProjectUserList = [];
	var projects = [];
	var files = [];
    
	this.init = function() {
        // Get the project list
        // TODO: Store the projects
		var msg = new Message();
		msg.fromVal("project:get-projects", undefined);
		modules.socket.sendMessage(msg);
		
        // Add context menu items
        // createContextMenu.addItem("New file", function(){$("#file-content").append($("#file-content").html())});
		createContextMenu.addItem("New file", function(){modules.projectManager.addFile();});
        createContextMenu.addItem("New project", function(){modules.projectManager.addProject();});
        
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
        
        this.updatePath();
	};
	
    this.updatePath = function() {
        $("#path").html("");
        if(this.currentPath.length == 0) {
            $("#path").html("/");
        }
        else {
            for(var i = 0; i < this.currentPath.length; i++) {
                var style = "path-folder";

                if(i == 0)
                    style = "path-project";
                
                var element = $("<div>");
                element.addClass(style);
                // TODO: Add onClick go back to path
                if(i == this.currentPath.length - 1)
                    element.html(this.currentPath[i]);
                else
                    element.html(this.currentPath[i] + " /");
                    
                $("#path").append(element);
            }
        }
    };
	
	this.addFile = function() {
		var dialogBox = new DialogBox();
		var msg = new Message();
		
		dialogBox.display(
			"<div id='create-file-informations'>" +
				"<input id='fileName' style='width:100%' type='text'/ placeholder='File name'/>" + 
				"<br><br>" + 
			"</div>" + 
			"<input type='button' onclick='modules.projectManager.createFile()' value='Create file'/>"
		, "Create a file");
	};
    
	this.addProject = function() {
		var dialogBox = new DialogBox();
		var msg = new Message();
		msg.fromVal("project:get-all-users", "");
		modules.socket.sendMessage(msg);
		
		dialogBox.display(
			"<div id='create-project-informations'>" +
                "Project informations<hr>" +
				"<input id='projectName' class='smallSize' type='text'/ placeholder='Project name'>" + 
				"<br><br><textarea id='projectDescription' style='height:170px;width:100%;' placeholder='Project description'></textarea>" + 
			"</div>" + 
			"<div id='create-project-users'>" + 
                "Add members<hr>" + 
				"<input onkeyup='modules.projectManager.refreshCreateProjectUserList()' id='createProjectSearch' style='margin-bottom: 10px; width:96%;' type='text'/ placeholder='Search a user...'>" + 
				"<div id='userList'></div>" + 
			"</div><input type='button' onclick='modules.projectManager.createProject()' value='Create project'/>"
		, "Create a project");
	};
	
	this.selectUser = function(e) {
        if(e.target.className == 'user' || e.target.className == 'user user-selected' || e.target.className == 'username') {
            createProjectUserList[$(e.target).data("userId")].isSelected = !createProjectUserList[$(e.target).data("userId")].isSelected;
            
            if(e.target.className == 'username')
                e.target = e.target.parentNode;
                
            $(e.target).toggleClass("user-selected");
        }
    };
	
	this.createFile = function() {
		var msg = new Message();
		msg.fromVal("project:add-file", {projectId: currentPath[0].folderId, parentId: currentPath[currentPath.length - 1].folderId, name: currentPath[currentPath.length - 1].folderId + $("#fileName").val(), isFolder: false});
		modules.socket.sendMessage(msg);
	};
    
    this.createProject = function() {
        var users = [];
        var msg = new Message();
        
        for(var i = 0; i < createProjectUserList.length; i++) {
            if(createProjectUserList[i].isSelected) {
                users.push({userId:createProjectUserList[i].userId, permissionLevel: (createProjectUserList[i].permissionLevel || 0)});
            }
        }
        
        msg.fromVal("project:add-project", {projectUsers: users, projectName: $("#projectName").val(), description: $("#projectDescription").val()});
        modules.socket.sendMessage(msg);
        //  message.data.projectName, message.data.projectUsers, message.data.description
       // console.log(createProjectUserList);
    };
    
    this.selectUserRights = function(e) {
        createProjectUserList[$(e).data("userId")].permissionLevel = e.options[e.selectedIndex].value;     
    };
    
    this.addContentToList = function(isFolder, name, permissionLevel, lastEditionDate) {
        var imageType = isFolder ? "folder" : "file";
        var element = $("<div>");
        var permissionName = "Unknown";
		if (!lastEditionDate)
			lastEditionDate = "Never";
                
        switch(permissionLevel) {
			default:
            case 0:
                permissionName = "Ready only";
                break;
            case 1:
                permissionName = "Write";
                break;
            case 2:
                permissionName = "Administrator";
                break;
            case 4:
                permissionName = "Creator";
                break;
        }

        element.addClass("file");
        element.html(
            '<span class="file-icon"><img src="resources/ui/images/folder.png" alt="' + imageType + '-image"/></span>' + 
            '<span class="file-title"' + onclick + '>' + name + '</span>' + 
            '<span class="file-last-modification">' + lastEditionDate + '</span>' + 
            '<span class="file-working-people">' + permissionName + '</span>'
        );
        
        element.on("contextmenu", function(e) {
            e.preventDefault();
            manageContextMenu.display(mouse.x, mouse.y);
        });
		
		element.on("click", function(){
			modules.projectManager.displayFiles();
		});
        
        $("#file-content").append(element);
    }
    
	this.displayContent = function(data) {
		if(data.length == 0) {
			$("#file-content").text("There's nothing here.");
		}
		else {
			$("#file-content").html("");
			for(var i = 0; i < data.length; i++) {
				this.addContentToList(data[i].isFolder, data[i].projectName, data[i].permissionLevel);
			}
			$("#file-history").html("");
		}
	};
	
	this.displayFiles = function() {
		console.log(projects.length);
		console.log(files.length);
		// Display only files that are in the current folder
		for (var i = 0; i < files.length; i++) {
			// CURRENT PATH DOESN'T WORK!!!
			/*if (files[i].projectId == currentPath[0].folderId) {
				// Make recursively ...
				this.addContentToList(files[i].isFolder, files[i].name, -1, files[i].lastEditionDate);
			}*/
		}
	};
  
	this.refreshCreateProjectUserList = function() {
        $("#userList").html("");

        for(var i = 0; i < createProjectUserList.length; i++) {
            
            if($("#createProjectSearch").val() != "") {
                if(createProjectUserList[i].username.toLowerCase().indexOf($("#createProjectSearch").val().toLowerCase()) == -1)
                    continue;
            }
            
            if(createProjectUserList[i].userId == selfUser.userId)
                continue;
            
            var element = $("<div>");
            element.addClass("user");
            
            if(createProjectUserList[i].isSelected)
                element.addClass("user-selected");
                
            element.on("click", function(e){modules.projectManager.selectUser(e)});
            element.data("userId", i);
            element.append(
                    "<span data-user-id='" + i + "' class='username'>" + createProjectUserList[i].username + "</span>" +
                    "<select data-user-id='" + i + "' onchange='modules.projectManager.selectUserRights(this)'>" + 
                        "<option value='0' " + (createProjectUserList[i].permissionLevel == 0 ? 'selected' : '') + ">Read only</option>" + 
                        "<option value='1' " + (createProjectUserList[i].permissionLevel == 1 ? 'selected' : '') + ">Write</option>" + 
                        "<option value='2' " + (createProjectUserList[i].permissionLevel == 2 ? 'selected' : '') + ">Administrator</option>" + 
                    "</select>"
            );
                
            $("#userList").append(element);
        }
        
        if($("#userList").text() == "")
           $("#userList").append("No results founds"); 
    };
    
	this.handleMessage = function(message) {
		switch(message.type) {
			case "project-list":
				projects = message.data;
				this.displayContent(projects, 0);
		
				// Get files for each project
				for (var i = 0; i < projects.length; i++) {
					var msg = new Message();
					msg.fromVal("project:get-files", {projectId: projects[i].projectId});
					modules.socket.sendMessage(msg);
				}
				break;
            case "file-list":
				for (var i = 0; i < message.data.length; i++)
					files.push(message.data[i]);
                break;
			case "all-users":
                createProjectUserList = message.data;
                this.refreshCreateProjectUserList();
				break;
			case "file-created":
				if(message.data.success) {
                    $(".shadow-box").remove(); 
                    $(".dialog-box").remove(); 
                    this.addContentToList(1, message.data.fileName, message.data.permissionLevel);
                }
                else {
					switch(message.data.code) {
                        case 0:
                            $("#projectName").prop("placeholder", "Already taken!");
                            $("#projectName").val("");
                            break;
                        case 1:
                            $(".dialog-box-title").html("Something went wrong, please retry");
                            break;
                    }
				}
				break;
            case "add-project-status":
                if(message.data.success) {
                    $(".shadow-box").remove(); 
                    $(".dialog-box").remove(); 
                    this.addContentToList(1, message.data.projectName, 4);
                }
                else {
                    switch(message.data.code) {
                        case 0:
                            $("#projectName").prop("placeholder", "Already taken!");
                            $("#projectName").val("");
                            break;
                        case 1:
                            $(".dialog-box-title").html("Something went wrong, please retry");
                            break;
                    }
                }
                break;
		}
	};
}