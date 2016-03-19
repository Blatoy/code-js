var ContextMenu = function() {
	this.items = [];
    this.x = 0;
    this.y = 0;
    
    // Add items to the context menu
    this.addItem = function(html, onClick) {
        this.items.push({html:html, onClick:onClick});
    }
    
    // Display the context menu
    this.display = function(x, y) {
        // Check if there's no other context menu
        if(contextMenuLocked) {
			return;
		}
            
        // Prevent to create multiple context menu
        contextMenuLocked = true;
        
        // Hide all previous context menu
        $(".context-menu").remove();
        
        // Set the position
        // TODO: Check max x / y
        if(x && y) {
            this.x = x;
            this.y = y;
        }
        else {
            this.x = mouse.x;
            this.y = mouse.y;
        }
        
        // Create the div
        var ctxMenu = $("<div>");
        
        // Add class & style
        ctxMenu.addClass("context-menu");
        ctxMenu.css("top", y + "px");
        ctxMenu.css("left", x + "px");
        
        // Add all items
        for(var i = 0; i < this.items.length; i++) {
            var element = $("<div>");
            element.addClass("context-menu-item");
            // Onclick, call the function
            element.on("click", this.items[i].onClick);
            // Set the html
            element.html(this.items[i].html);
            // Add the element to the context menu
            ctxMenu.append(element);
        }
        
        // Add to the page
        $("#content").append(ctxMenu);
    }
}

// On document click, hide all the context menu
$(document).click(function(e) {
    $(".context-menu").remove(); 
    contextMenuLocked = false;
});

// var ctxMenu = new ContextMenu([{html:"File", onClick:function(){alert('test');}}, {html:"Project", onClick:function(){alert('Chèvre');}}]);