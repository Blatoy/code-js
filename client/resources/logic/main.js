// main.js (client)
// handle the initialisation of the program

// rip
"use strict";

var modules = {};
var currentPage;
var isServerReady = false;
// Save the mouse position
var mouse = {x: 0, y:0};
// Prevent the display of multiple context menu
var contextMenuLocked = false;


function init() {
	// Include the paths config
	$.getScript("resources/logic/config/paths.js", function() {
		// Load the config
		$.getScript(CONFIG_PATHS["config"] + "global.js", function() {
			// Load every files
            $.getScript(CONFIG_PATHS["config"] + "global.js");
            $.getScript(CONFIG_PATHS["config"] + "default-server.js");
            
            $.getScript(CONFIG_PATHS["class"] + "Message.js");
            $.getScript(CONFIG_PATHS["class"] + "Socket.js");
            $.getScript(CONFIG_PATHS["class"] + "ContextMenu.js");
            $.getScript(CONFIG_PATHS["class"] + "DialogBox.js");
            
            // Change the page connecting when the file is loaded
            $.getScript(CONFIG_PATHS["core"] + "connecting.js", function(){
				modules.connecting = new Connecting();
                changePage("connecting", function(){
                    modules.connecting.init();
                });
            });
            
            $.getScript(CONFIG_PATHS["core"] + "editor.js", function(){
               /* modules.editor = new Editor();
               modules.editor.init();*/
            });
            
            $.getScript(CONFIG_PATHS["core"] + "login.js", function(){
                modules.login = new Login();
            });
            
            $.getScript(CONFIG_PATHS["core"] + "project-manager.js", function(){
               /* modules.projectManager = new ProjectManager();
               modules.projectManager.init();*/
            });
		});
		
		$.getScript(CONFIG_PATHS["config"] + "default-server.js", function() {});
	});
}


// Probably a good idea to move on a tool.js
function loadStyles(styles) {
    // Convert to array if needed
    if(typeof styles != "array")
        styles = [styles];
    // Add the styles
    for(var i = 0; i < styles.length; i++) {
        $("head").append('<link rel="stylesheet" href="' + styles[i] + '.css" type="text/css" />');
    }
}

// Load all the scripts
function loadScripts(scripts, callback) {
    if(typeof scripts != "array")
        scripts = [scripts];
        
    // Used to callback
    var elementLoaded = 0;
    var elementToLoad = scripts.length;
    
	var onLoadFinished = function() {
        // Increment, if all loaded, callback();
		if(++elementLoaded == elementToLoad)
			if(callBack)
				callBack();
	};
    
    // Import the scripts
    for(var i = 0; i < scripts.length; i++) {
        $.getScript(CONFIG_PATHS["core"] + fileName + ".js", onLoadFinished);
    }
}

// Load #top-bar and #content from filename
function changePage(fileName, callBack) {
	var elementToLoad = 2;
	var elementLoaded = 0;
    
	var onLoadFinished = function() {
        // Increment, if all loaded, callback();
		if(++elementLoaded == elementToLoad) {
            // Display the page with an effect
            $("#page-content").hide();
            $("#page-content").fadeIn();
			if(callBack)
				callBack();
		}
	}
    
    // If it's already the current page, callback();
    if(currentPage == fileName) {
        if(callBack)
            callBack();
        return;
    }
        
    $("#page-content").fadeOut();
    $("#page-content").hide();
    
	// Clear page
	$("#top-bar").html("");
	$("#content").html("");
    
	// Add the style
	$("head").append('<link rel="stylesheet" href="' + CONFIG_PATHS["styles"] + fileName + '.css" type="text/css" />');

	$("#top-bar").load(CONFIG_PATHS["pages"] + fileName + ".html #page-header", onLoadFinished);
	$("#content").load(CONFIG_PATHS["pages"] + fileName + ".html #page-content", onLoadFinished);

    currentPage = fileName;
	
    // TODO: Move to loadStyle([]); when needed
	/*$.getScript(CONFIG_PATHS["core"] + fileName + ".js", onLoadFinished);
	if (fileName == "editor") {
		$("head").append('<script src="'+CONFIG_PATHS["tools"]+'codemirror-5.12/lib/codemirror.js"></script>');
		$("head").append('<script src="'+CONFIG_PATHS["core"]+'editor.js"></script>');
		$("head").append('<script src="'+CONFIG_PATHS["tools"]+'codemirror-5.12/mode/javascript/javascript.js"></script>');
		$("head").append('<link rel="stylesheet" href="'+CONFIG_PATHS["tools"]+'codemirror-5.12/lib/codemirror.css" type="text/css" />');
		$("head").append('<link rel="stylesheet" href="'+CONFIG_PATHS["tools"]+'codemirror-5.12/theme/3024-day.css" type="text/css" />');
	}
	
    */
}

// Update the mouse position
document.onmousemove = function(e){
    mouse.x = (e.clientX || e.pageX); 
    mouse.y = (e.clientY || e.pageY);
}

init();