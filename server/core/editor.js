// editor.js (core) (server)
// ...

module.exports = function() {
    this.handleMessage = function(message, client) {
		switch (message.type) {
			case "get-file-content":
				controller.fileController.getFileContent(client, message.data);
				break;
			case "add-content":
				controller.fileController.addCharToFile(client, message.data.fileId, message.data.pos, message.data.value, message.data.line, message.data.ch);
				break;
			case "remove-content":
				controller.fileController.removeCharFromFile(client, message.data.fileId, message.data.pos, message.data.length, message.data.lineFrom, message.data.chFrom, message.data.lineTo, message.data.chTo);
				break;
		}
    }
}