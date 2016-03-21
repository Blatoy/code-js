// editor.js (core) (server)
// ...

module.exports = function() {
    this.handleMessage = function(message, client) {
		switch (message.type) {
			case "get-file-content":
				controller.fileController.getFileContent(client, message.data);
				break;
		}
    }
}