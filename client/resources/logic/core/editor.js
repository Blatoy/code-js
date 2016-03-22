var Editor = function(){
	this.codeMirror;
	this.ignoreChange = false;
	
	
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
		
		$("#user-information").text(selfUser.username);
		modules.projectManager.updateTree(true);
	};
	
	this.handleTextChange = function(mirror, e) {
		console.log(e);
		if(modules.editor.ignoreChange) {
			modules.editor.ignoreChange = false;
			return;
		}

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
			var remMsg = new Message();
			console.log(e.to);
			remMsg.fromVal("editor:remove-content", {fileId: openedFiles[openedFileIndex], pos: index, length: textRemovedLength, lineFrom: e.from.line, chFrom: e.from.ch, lineTo: e.to.line, chTo: e.to.ch});
			modules.socket.sendMessage(remMsg);
		}
		
		if(textAdded.length > 0) {
			var addMsg = new Message();
			addMsg.fromVal("editor:add-content", {fileId: openedFiles[openedFileIndex], pos: index, value: textAdded, line: e.from.line, ch: e.from.ch});
			modules.socket.sendMessage(addMsg);
		}
	};
	
	this.addCharacter = function(fileId, pos, value, line, ch) {
		if(openedFiles[openedFileIndex] == fileId) {
			modules.editor.ignoreChange = true;
			modules.editor.codeMirror.replaceRange(value, {line:line, ch:ch});
		}
	};
	
	this.removeCharacter = function(fileId, pos, length, lineFrom, chFrom, lineTo, chTo) {
		if(openedFiles[openedFileIndex] == fileId) {
			modules.editor.ignoreChange = true;
			modules.editor.codeMirror.replaceRange("", {line:lineFrom, ch:chFrom}, {line:lineTo, ch:chTo});
		}
	};
	
	this.handleMessage = function(message) {
		switch(message.type) {
			case "file-content":
				modules.editor.codeMirror.setValue(message.data.content);
				this.codeMirror.on("change", function(mirror, e){modules.editor.handleTextChange(mirror, e)});
				break;
			case "add-content":
				modules.editor.addCharacter(message.data.fileId, message.data.pos, message.data.value, message.data.line, message.data.ch);
				break;
			case "remove-content":
				modules.editor.removeCharacter(message.data.fileId, message.data.pos, message.data.length, message.data.lineFrom, message.data.chFrom, message.data.lineTo, message.data.chTo);
				break;
		}
	};
};