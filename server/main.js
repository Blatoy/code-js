// main.js (server)
// Initialize server, creates objects and connects to database
global.startTime = new Date().getTime();

"use strict";
// Global variables
global.modules = {core:{}, classes:{}, config:{}};
global.cores = {};
global.controller;
global.socket;
global.database;
global.tables;


// INITIALISATION
function init() {
    console.log("----------------------------------------------");
    console.log("CodeJS (Server) by 4HIN (2015-2016) / CIFOM-ET");
    console.log("----------------------------------------------");
    console.log("");
    
	// Include all files
	includeLogic();
    
    log("Initializing websocket", "debug");
    
	// Create socket
	global.socket = new modules.classes.Socket();
	global.socket.init(modules.config.global.websocket.port);
	
    log("Connecting to the database", "debug");

	// Connection to database
	global.database = new modules.classes.Database(modules.config.database.path);
	global.database.init();	
    global.tables = modules.config.database.tables;

    log("Initializing controllers", "debug");
	
	// Create controller
	global.controller = new modules.classes.Controller(new modules.classes.UserController(database, tables), new modules.classes.FileController(), new modules.classes.ProjectController());
   
    // Load cores
    log("Initializing core files", "debug");
    global.cores.login = new modules.core.login();
    global.cores.editor = new modules.core.editor();
    global.cores.projectManager = new modules.core.projectManager();
    
	/*database.queryPrep("SELECT * FROM user WHERE Username = ?;", [['michael']], function(err, row) {
		if (err)
			console.log(err);
		else
			console.log(row);
	});*/
    
    var inputHandler = new modules.classes.InputHandler();
			
	// Websocket
	socket.ws.on("connection", function(client) {
		// Initialization of user
		// Creation of the user & Add it to the user controller
		controller.userController.createClient(client);
		
		// Listening for any message
		client.on("message", function(data) {
			var message = new modules.classes.Message(JSON.parse(data));
			socket.handleMessage(message, client);
		});
	});

    log("Server ready [" + ((new Date().getTime()) - global.startTime) + "ms]", "info");
 
    inputHandler.init();
 
	// Cannot work => move on handleMessage
	/*socket.ws.on("leave", function(client) {
		var user = controller.userController.getUser(client);
		userController.removeUser(user);
		console.log("Client removed");
	});*/
}

function includeLogic() {
	// Link config
	modules.config.paths = require("./resources/config/paths.js");
	modules.config.database = require(modules.config.paths.config + "database.js");
	modules.config.global = require(modules.config.paths.config + "global.js");
	modules.config.print = require(modules.config.paths.config + "print.js");
    
    log("Starting CodeJS (v" + modules.config.global.version + ")", "info");
    log("Loading core files", "debug");

	// Link core files
	modules.core.editor = require(modules.config.paths.core + "editor.js");
	modules.core.login = require(modules.config.paths.core + "login.js");
	modules.core.projectManager = require(modules.config.paths.core + "project-manager.js");
	
    log("Loading classes", "debug");
    
	// Link class files
	modules.classes.Controller = require(modules.config.paths.classes + "Controller.js");
	modules.classes.UserController = require(modules.config.paths.classes + "UserController.js");
	modules.classes.FileController = require(modules.config.paths.classes + "FileController.js");
	modules.classes.ProjectController = require(modules.config.paths.classes + "ProjectController.js");
	modules.classes.User = require(modules.config.paths.classes + "User.js");
	modules.classes.File = require(modules.config.paths.classes + "File.js");
	modules.classes.Project = require(modules.config.paths.classes + "Project.js");
	modules.classes.Client = require(modules.config.paths.classes + "Client.js");
	modules.classes.Database = require(modules.config.paths.classes + "Database.js");
	modules.classes.Message = require(modules.config.paths.classes + "Message.js");
	modules.classes.Socket = require(modules.config.paths.classes + "Socket.js");
	modules.classes.InputHandler = require(modules.config.paths.classes + "InputHandler.js");
}

global.log = function(message, type, fileName) {
    var colors = modules.config.print.colors;        
    // If type is debug, check if debug is enabled
    if(type == "debug" && !modules.config.global.debug)
        return;

    if(modules.config.global.debug) {
        // Get the default fileName if not specified
        if(!fileName)
            fileName = module.filename.slice(__filename.lastIndexOf("\\") + 1, module.filename.length);
        
        // Make the filename 10 char long
        if(fileName.length > 10)
            fileName = fileName.substr(0, 9) + " ";
        else
            fileName += ((" ").repeat(10 - fileName.length));
        
        fileName = "" + fileName + colors.reset + "";
    }
    else
        fileName = "";
    
    var message = fileName + colors.bold + message + colors.reset;
    
    // Display the right message
    switch(type) {
        case "err":
        case 0:
            console.log(modules.config.print.messages.error + message);
            break;
		default:
        case "info":
        case 1:
            console.log(modules.config.print.messages.info + message);
            break;
        case "warn":
        case 2:
            console.log(modules.config.print.messages.warning + message);
            break;
        case "debug":
        case 3:
            console.log(modules.config.print.messages.debug + message);
            break;
		
    }
}

// Used to align text
global.pad = function(str, length, replacement, left) {
    if(typeof str != "string")
        str = String(str);

    if(str.length > length)
        return str.slice(0, length);

    if(replacement == undefined)
        replacement = " ";

    if(left)
        return replacement.repeat(length - str.length) + str;
    else
        return str + replacement.repeat(length - str.length);
}

init();

