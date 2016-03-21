var Editor = function(){
	this.codeMirror;
	
	this.init = function(){

	};
	
	this.loadFile = function(fileId) {
		var msg = new Message();
		msg.fromVal("editor:get-file-content", fileId);
		modules.socket.sendMessage(msg);
	};
	
	this.initCodeMirror = function() {
		this.codeMirror = CodeMirror.fromTextArea(document.getElementById('mirror-textarea'), {
			lineNumbers: true,
			mode: "text/javascript",
			theme: "eclipse"
		});
	};
	
	this.handleMessage = function(message) {
			switch(message.type) {
				case "file-content":
					modules.editor.codeMirror.setValue(message.data.content);
					console.log(modules.editor);
					break;
			}
	};
};