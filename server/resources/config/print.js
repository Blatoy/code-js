// print.js (config) (server)
// Contain things to print to the console

var colors = {
    red: "\033[31m",
    green: "\033[32m",
    magenta: "\033[35m",
    blue: "\033[36m",
    white: "\033[37m",
    bold: "\033[1m",
    reset: "\033[0m"
};

var messages = {
    info: colors.green +   "[INFO]    " + colors.reset,
    error: colors.red +    "[ERROR]   " + colors.reset,
    warning: colors.blue + "[WARNING] " + colors.reset,
    debug: colors.magenta +"[DEBUG]   " + colors.reset
};

module.exports = {
    messages: messages,
    colors: colors
}