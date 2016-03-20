// InputHandle.js (class) (server)
// Do commands when things are written in the console
var readline = require('readline');

module.exports = function(client, clientId) {
    var rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var commandList = {
        help: {
            help: "Display this help",
            action: function(){
                for(key in commandList) {
                    log(key + (" ").repeat(10 - key.length) + commandList[key].help, "info", "InputHandler.js");
                }
            }
        },
        userlist: {
            help: "Display current users",
            action: function(){
                log("CID   UID   Username    Ping", "info", "InputHandler.js");
                for(key in controller.userController.users) {
                    log(
                        pad(controller.userController.users[key].clientId, 5) + " " +
                        pad(controller.userController.users[key].userId, 5) + " " +
                        pad(controller.userController.users[key].username, 11) + " " +
                        controller.userController.users[key].userPing + "ms"
                        , "info", "InputHandler.js");
                }
            }
        },
        exit: {
            help: "Stop the server",
            action: function(){
                process.exit();
            }
        },
        e: {
            help: "Stop the server",
            action: function(){
                process.exit();
            }
        },
        about: {
            help: "Give informations",
            action: function(){
                log("CodeJS server version " + modules.config.global.version, "info", "InputHandler.js");
                log("Made by 4HIN / CIFOM-ET 2015-2016 ", "info", "InputHandler.js");
                var time = (new Date().getTime() - global.startTime);
                var hours = Math.round(time / 1000 / 60 / 60);
                var minutes = Math.round(time / 1000 / 60);
                var seconds = Math.round(time / 1000) % 60;
                log("Server uptime: " + hours + ":" + minutes + ":" + seconds, "info", "InputHandler.js");
            }
        },
        cls: {
            help: "Clear the console",
            action: function(){
                var lines = process.stdout.getWindowSize()[1];
                for(var i = 0; i < lines; i++) {
                    console.log('\r\n');
                }
            }
        },
        debug: {
            help: "Toggle debug mode",
            action: function(){
                modules.config.global.debug = !modules.config.global.debug;
                log("Debug: " + modules.config.global.debug, "info", "InputHandler.js");
            }
        },
        eval: {
            help: "Eval arguments if debug is enabled (MAY CRASH)",
            action: function(args){
                if(modules.config.global.debug) {
                    try {
                        eval(args.join(" "));
                    }
                    catch(e) {
                        log("Eval: cannot perform the command", "err", "InputHandler.js");
                    }
                }
            }
        }
    };
    
    this.handleCommand = function(text) {
        var command = text.split(" ", 1)[0];
        var arguments = text.split(" ");
        arguments.shift();

        if(!commandList[command])
            log("Command not found", "err", "InputHandler.js");
        else
            commandList[command].action(arguments);
    }
    
    this.question = function() {
        rl.question("" , (answer) => {
            this.handleCommand(answer);
            this.question();
        });
    };
    
    
    this.init = function() {
        this.question();
    };
};