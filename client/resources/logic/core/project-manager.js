var projectManager = function() {
    // Create context menu
    this.currentPath = [];
    var createContextMenu = new ContextMenu();
    var manageContextMenu = new ContextMenu();
    var createProjectUserList = [];
	this.projects = [];
    this.files = [];
	// Michael: Doing some tests
	var clickedItem;
    
	this.init = function() {
        // Get the project list
        // TODO: Store the projects
		var msg = new Message();
		msg.fromVal("project:get-projects");
		modules.socket.sendMessage(msg);
		
        // Add context menu items
        // createContextMenu.addItem("New file", function(){$("#file-content").append($("#file-content").html())});
		createContextMenu.addItem("New file", function(){modules.projectManager.addFile();});
		createContextMenu.addItem("New folder", function(){modules.projectManager.addFolder();});
        createContextMenu.addItem("New project", function(){modules.projectManager.addProject();});
      

      
        // TODO: Check on how to get the item ID
        manageContextMenu.addItem("Rename", function(){modules.projectManager.openRenameDialog();});
        manageContextMenu.addItem("Move", function(){});
        manageContextMenu.addItem("Delete", function(){});
		manageContextMenu.addItem("<hr>New file", function(){modules.projectManager.addFile();});
		manageContextMenu.addItem("New folder", function(){modules.projectManager.addFolder();});
        manageContextMenu.addItem("New project", function(){modules.projectManager.addProject();});
        
        
        // Display all context menu
        $("#file-content").on("contextmenu", function(e){
            e.preventDefault();
            e.stopPropagation();
            if(modules.projectManager.currentPath.length == 0) {
                createContextMenu.hideItem(0);
                createContextMenu.hideItem(1);
            }
            else {
                createContextMenu.showItem(0);
                createContextMenu.showItem(1);
            }
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
        
        // Add root
        var element = $("<div>");
        element.addClass("path-project");
        element.html("Project list / ");
        element.on("click", function(){
            modules.projectManager.currentPath.length = 0;
            modules.projectManager.updatePath();
        });

        $("#path").append(element);
                
        for(var i = 0; i < this.currentPath.length; i++) {
            var style = "path-folder";

            if(i == 0)
                style = "path-project";
            
            var element = $("<div>");
            element.addClass(style);
            (function(i){
                element.on("click", function(){
                    modules.projectManager.currentPath.length = (i + 1);
                    modules.projectManager.updatePath();
                });
            }(i))
            // TODO: Add onClick go back to path
            element.html(this.currentPath[i].name + " /");
                
            $("#path").append(element);
        }
        
        // Update the file list
        modules.projectManager.displayContent();
    };
	
	this.addFile = function() {
		var dialogBox = new DialogBox();
		var msg = new Message();
		
		dialogBox.display(
			"<div id='create-file-informations'>" +
				"<input id='fileName' style='width:100%' type='text'/ placeholder='File name' />" + 
				"<br><br>" + 
			"</div>" + 
			"<input type='button' onclick='modules.projectManager.createFile(0)' value='Create file'/>"
		, "Create a file");
        setTimeout(function(){
            $("#fileName").focus();
        }, 1);
	};
    
    this.addFolder = function() {
		var dialogBox = new DialogBox();
		var msg = new Message();
		
		dialogBox.display(
			"<div id='create-file-informations'>" +
				"<input id='fileName' style='width:100%' type='text'/ placeholder='Folder name' />" + 
				"<br><br>" + 
			"</div>" + 
			"<input type='button' onclick='modules.projectManager.createFile(1)' value='Create folder'/>"
		, "Create a file");
        setTimeout(function(){
            $("#fileName").focus();
        }, 1);
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
	
	this.createFile = function(isFolder) {
		var parentID = modules.projectManager.currentPath == 1 ? -1 : modules.projectManager.currentPath[modules.projectManager.currentPath.length -1].folderId;
	
		var msg = new Message();
		msg.fromVal("project:add-file", {
            projectId: modules.projectManager.currentPath[0].folderId,
            parentId: parentID, 
            name: $("#fileName").val(), 
            isFolder: isFolder
        });
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
    };
    
    this.selectUserRights = function(e) {
        createProjectUserList[$(e).data("userId")].permissionLevel = e.options[e.selectedIndex].value;     
    };
    
    this.addContentToList = function(isFolder, name, permissionLevel, lastEditionDate, id) {
        var imageType = isFolder ? "folder" : "file";

        var element = $("<div>");
        var permissionName = "Unknown";
		if (!lastEditionDate)
			lastEditionDate = "Never";
                
        switch(permissionLevel) {
            case 0:
                permissionName = "Read only";
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
            default:
                permissionName = "-";
                break;
        }

        element.addClass("file");
        element.html(
            '<span class="file-icon"><img src="resources/ui/images/' + imageType + '.png" alt="' + imageType + '-image"/></span>' + 
            '<span class="file-title"' + onclick + '>' + name + '</span>' + 
            '<span class="file-last-modification">' + lastEditionDate + '</span>' + 
            '<span class="file-working-people">' + permissionName + '</span>'
        );
        
        element.on("contextmenu", function(e) {
			// Needed values for renaming
			clickedItem = e.target;
			$(clickedItem).data("id", id);
			if (modules.projectManager.currentPath.length == 0)
				$(clickedItem).data("isProject", true);
			else
				$(clickedItem).data("isProject", false);
			
            e.preventDefault();
            if(modules.projectManager.currentPath.length == 0) {
                manageContextMenu.hideItem(3);
                manageContextMenu.hideItem(4);
                manageContextMenu.hideItem(5);
            }
            else {
                manageContextMenu.showItem(3);
                manageContextMenu.showItem(4);
                manageContextMenu.showItem(5);
            }
            manageContextMenu.display(mouse.x, mouse.y);
        });

		element.on("click", function(e){
            if(isFolder) {
                modules.projectManager.currentPath.push({folderId: id, name: name});
                modules.projectManager.updatePath();
            }
            else {
                changePage("editor", function(){
                    alert(id);
                });
            }
			// modules.projectManager.displayFiles();
		});
        
        $("#file-content").append(element);
    }
    
	this.displayContent = function() {
		if(this.projects.length == 0) {
			// $("#file-content").text("There's nothing here.");
		}
		else {
			$("#file-content").html("");
            // Display projects
            // TODO: Fix search to search on child too
            if(this.currentPath.length == 0) {
                for(var i = 0; i < this.projects.length; i++) {
                    if($("#search").val().length == 0 || this.projects[i].projectName.toLowerCase().indexOf($("#search").val().toLowerCase()) != -1)
                        this.addContentToList(1, this.projects[i].projectName, this.projects[i].permissionLevel, "Never", this.projects[i].projectId);
                }
            }
            else {
                // Display files
                for(var i = 0; i < this.files.length; i++) {
                    if(this.files[i].projectId == this.currentPath[0].folderId) {
                        if(this.files[i].parentFolderId == this.currentPath[this.currentPath.length - 1].folderId || (this.currentPath.length == 1 && this.files[i].parentFolderId == 0))
                            if($("#search").val().length == 0 || this.files[i].name.toLowerCase().indexOf($("#search").val().toLowerCase()) != -1)
                                this.addContentToList(this.files[i].isFolder, this.files[i].name, -1, "Never", this.files[i].id);
                    }
                }
            }
			$("#file-history").html("");
		}
	};
  
    // Refresh the userlist on add project dialog
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
	
	this.openRenameDialog = function() {
		var dialogBox = new DialogBox();
		var previousName = "";
		
		// Find previous name
		if ($(clickedItem).data("isProject")) {
			for (var i = 0; i < this.projects.length; i++) {
				if (this.projects[i].projectId == $(clickedItem).data("id"))
					previousName = this.projects[i].projectName;
			}
		}
		else {
			for (var i = 0; i < this.files.length; i++) {
				if (this.files[i].id == $(clickedItem).data("id"))
					previousName = this.files[i].name;
			}
		}
		
		dialogBox.display(
			"<div id='rename'>" +
				"<input id='objName' style='width:100%' type='text'/ placeholder='Name' value='" + previousName + "' />" + 
				"<br><br>" + 
			"</div>" + 
			"<input type='button' onclick='modules.projectManager.rename()' value='Rename'/>"
		, "Rename");
        setTimeout(function(){
            $("#objName").select();
        }, 1);
	};
	
	this.rename = function() {
		// Currently doesn't handle projects
		var msg = new Message();
		msg.fromVal("project:rename", {name: $("#objName").val(), elementId: $(clickedItem).data("id"), isProject: $(clickedItem).data("isProject")});
		modules.socket.sendMessage(msg);
	};
    
	this.handleMessage = function(message) {
		switch(message.type) {
			case "project-list":
				this.projects = message.data;
				this.displayContent();
		
				// Get files for each project
                // TODO: One query to get all files
				for (var i = 0; i < this.projects.length; i++) {
					var msg = new Message();
					msg.fromVal("project:get-files", {projectId: this.projects[i].projectId});
					modules.socket.sendMessage(msg);
				}
				break;
            case "file-list":
				for (var i = 0; i < message.data.length; i++)
					this.files.push(message.data[i]);
                break;
			case "all-users":
                createProjectUserList = message.data;
                this.refreshCreateProjectUserList();
				break;
			case "file-created":
				if(message.data.success) {
                    $(".shadow-box").remove(); 
                    $(".dialog-box").remove(); 
                  //  {success: true, fileName: name, parentId: parentId, isFolder: isFolder,permissionLevel: row.permissionLevel});
                    this.files.push(message.data);
                    this.displayContent();
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
			case "renamed":
				if (message.data.success) {
					// Hide dialog
					$(".shadow-box").remove(); 
                    $(".dialog-box").remove();
					
					// Update arrays
					if (message.data.isProject) {
						for (var i = 0; i < this.projects.length; i++) {
							if (this.projects[i].projectId == message.data.id)
								this.projects[i].projectName = message.data.newName;
						}
					}
					else {
						for (var i = 0; i < this.files.length; i++) {
							if (this.files[i].id == message.data.id)
								this.files[i].name = message.data.newName;
						}
					}
					
					// Update display list
					this.displayContent();
				}
				else {
					$("#objName").prop("placeholder", "Error occured!");
					$("#objName").val("");
				}
				break;
            case "add-project-status":
                if(message.data.success) {
                    $(".shadow-box").remove(); 
                    $(".dialog-box").remove();
                    this.projects.push(message.data);
                    // data = {success: true, projectName: projectName, projectUsers: projectUsers, creationDate: date, creator: user.userId};
                    // this.addContentToList(1, message.data.projectName, 4, "Never", message.data.projectId);
                    this.displayContent();
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