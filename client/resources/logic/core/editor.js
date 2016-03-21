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
			theme: "3024-day"
		});
		
		console.log(this.codeMirror);
	};
	
	this.loadStyles = function() {
		loadStyles([CONFIG_PATHS["tools"] + "3codemirror-5.12/lib/codemirror.css", CONFIG_PATHS["tools"] + "codemirror-5.12/theme/3024-day.css"]);
	};
};

function initCodeMirror() {

}