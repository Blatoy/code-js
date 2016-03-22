var Editor = function(){
	this.codeMirror;
	
	this.init = function(){
		// this.codeMirror =
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
			theme: "eclipse",
		});
	};
	
	this.handleTextChange = function(mirror, e) {
		var index = 0;
		for(var i = 0; i < e.from.line; i++) {
			index += modules.editor.codeMirror.getLine(i).length + 2;
		}
		
		index += e.from.ch;
	
		var textRemovedLength = 0;
		for(var i = 0; i < e.removed.length; i++) {
			textRemovedLength += e.removed[i].length;
			if(i + 1 < e.removed.length) {
				textRemovedLength += 2;
			}
		}

		var textAdded = "";

		for(var i = 0; i < e.text.length; i++) {
			textAdded += e.text[i];
			if(i + 1 < e.text.length) {
				textAdded += "\r\n";
			}
		}		
		
		if(textRemovedLength > 0) {
			console.log(textRemovedLength + " - " + index);
			var remMsg = new Message();
			remMsg.fromVal("editor:remove-content", {fileId: openedFiles[openedFileIndex], pos: index, length: textRemovedLength});
			modules.socket.sendMessage(remMsg);
		}
		
		if(textAdded.length > 0) {
			var addMsg = new Message();
			addMsg.fromVal("editor:add-content", {fileId: openedFiles[openedFileIndex], pos: index, value: textAdded});
			modules.socket.sendMessage(addMsg);
		}
	};
	
	this.handleMessage = function(message) {
		switch(message.type) {
			case "file-content":
				modules.editor.codeMirror.setValue(message.data.content);
				this.codeMirror.on("change", function(mirror, e){modules.editor.handleTextChange(mirror, e)});
				break;
		}
	};
};