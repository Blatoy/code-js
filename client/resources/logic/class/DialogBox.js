var DialogBox = function() {
    this.x = 0;
    this.y = 0;
    
    // Display the context menu
    this.display = function(content, title) {
        // Create the div
        var dialogBox = $("<div>");
        var shadowBox = $("<div>");
		shadowBox.addClass("shadow-box");
        // Add class & style
        dialogBox.addClass("dialog-box");
        dialogBox.html("<div class='dialog-box-title'>" + title + "</div><hr>");
        dialogBox.append(content);
		
        // Add to the page
        $("#content").append(shadowBox);
        $("#content").append(dialogBox);
		
		// On document click, hide all the context menu
		$(shadowBox).click(function(e) {
			$(".shadow-box").hide(); 
			$(".dialog-box").hide(); 
		});

    }
}
// var ctxMenu = new ContextMenu([{html:"File", onClick:function(){alert('test');}}, {html:"Project", onClick:function(){alert('Chèvre');}}]);