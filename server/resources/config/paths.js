// paths.js (config) (server)
// Contain where things are saved on the server

var paths = {};

paths["root"]               = __dirname + "\\..\\..\\";
paths["classes"]		    = paths["root"] 		+ "class\\";
paths["core"]	    	    = paths["root"] 		+ "core\\";
paths["data"]		        = paths["root"] 		+ "data\\";
paths["projects"]    	  	= paths["data"] 		+ "projects\\";
paths["database"]		    = paths["data"] 		+ "database\\";
paths["resources"]  	    = paths["root"] 		+ "resources\\";
paths["config"]      	    = paths["resources"] 	+ "config\\";
paths["nodeModules"]      	= paths["resources"] 	+ "node_modules\\";

module.exports = paths;