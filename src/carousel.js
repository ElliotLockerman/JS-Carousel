

// Checks if a DOM node or any of its children (recursively) has a certain class
function get_sub_node(root, node_name)
{
	
	if(root.nodeName === node_name) return root;
	else{
		for (child in root.childNodes)
		{
			if(root.childNodes[child].nodeType === 1) // If its a DOM node
			{
				return get_sub_node(root.childNodes[child], node_name)
			}
		}
	}
	
	return false;
}





var carousels = [];

function Carousel(reference)
{	
	var self = this;
	
	self.carousel_main = reference;

	self.transition_time = 10; // Default, may be overwritted by config file
	self.number_of_frames_per_transition = 40; // Default, may be overwritted by config file
	

	// Request the config file and load it up
	self.config;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", document.URL + "src/config.json", true);
	xhr.onreadystatechange = function(data)
	{
	    if (xhr.readyState == 4) 
		{
			self.config = JSON.parse(xhr.responseText);
	
			
			// Number of frames per transition
			if(typeof self.config.transition_time === "number") 
				self.transition_time = self.config.transition_time;
			
			// Number of frames per transition
			if(typeof self.config.number_of_frames_per_transition === "number") 
				self.number_of_frames_per_transition = self.config.number_of_frames_per_transition;
			
		}
	}
	xhr.send();
	
	
	// Get all the thumbs
	self.thumbs = new Array();
	for (var child in self.carousel_main.childNodes)
	{	
		if(self.carousel_main.childNodes[child].nodeType === 1 && 
			has_sub_node_class(self.carousel_main.childNodes[child], "thumb_image")) // If its a DOM node and it or one of its children has the right class
		{		
				self.thumbs.push(self.carousel_main.childNodes[child]);
		}
		
	}
	
	
	
	// Wrap the thumbs
	self.thumb_wrapper = document.createElement("div"); 
	self.thumb_wrapper.setAttribute("class", "thumb_wrapper");
	self.carousel_main.appendChild(self.thumb_wrapper);
	
	for(thumb in self.thumbs)
	{
		self.thumb_wrapper.appendChild(self.thumbs[thumb]);
	}
	
	
	// Create primary wrapper and add imgs
	self.primary_wrapper = document.createElement("div"); 
	self.primary_wrapper.setAttribute("class", "primary_wrapper");
	self.carousel_main.insertBefore(self.primary_wrapper, self.thumb_wrapper);
	
	for(thumb in self.thumbs)
	{
		link_node = get_sub_node(self.thumbs[thumb], "A")
		if(link_node)
		{
			var new_img = document.createElement("img");
			new_img.setAttribute("src", link_node.href);
			new_img.setAttribute("class", "primary_image");
			self.primary_wrapper.appendChild(new_img);			
		}
		else
		{
			console.error("Error: The following thumbnail does not have a link to the full-size image", self.thumbs[thumb]);
		}
	}
	
	
	
	
	
	 
	// Create objects which do the rest
	var sub_carousels
	self.primary_carousel = new Sub_carousel(self, self.primary_wrapper, "primary_", 1);
	sub_carousels.push(self.primary_carousel);
	self.thumb_carousel = new Sub_carousel(self, self.thumb_wrapper, "thumb_", "auto");
	sub_carousels.push(self.thumb_carousel);






	function Sub_carousel(outer_object, outer_div, prefix, elements_per_frame)
	{

		self.slider_position = 0; // Which element's being pointed at. multiply by element_width to get offset, and -1 for movement to left (right button).



		// Get elements array, number of elements, and element width
		self.elements = new Array();
		for(var child in outer_div.childNodes)
		{
			if(self.carousel_main.childNodes.hasOwnProperty(child) && 
				self.carousel_main.childNodes[child].className === prefix + "image")
			{
				self.elements.push(self.carousel_main.childNodes[child]);
			}
		}
		self.number_of_elements = self.elements.length;

	
	

		// Create mask and slider
		self.mask = document.createElement("div");
		self.mask.setAttribute("class", prefix + "mask");
		self.outer_div.appendChild(self.mask);

		self.slider = document.createElement("div");
		self.slider.setAttribute("class", prefix + "slider");
		self.outer_div.appendChild(self.slider);
	
	
	
	
		// Add images to slide
		for(var index in self.elements)
		{
			self.slider.appendChild(self.elements[index]);
		}

	
		// Calculate and set element's heights 

		// Get some styles
		self.element_width = px_to_int(window.getComputedStyle(self.elements[0]).width);		
		self.slider_styles = window.getComputedStyle(self.slider);
	
		// Overwrite no-js defaults
		self.carousel_main.style["overflow-x"] = "auto";
	
	

		self.frame_delay = this.transition_time / self.number_of_frames_per_transition;	
		self.offset_width = self.element_width / self.number_of_frames_per_transition;
		self.target_position = 0; // Which element is being, or is intended to be, displayed; changed *before* animation begins; 0 indexed
	
	
	
	
	
	
	
		//create buttons
		// Left
		self.left_button = document.createElement("div");
		self.left_button.setAttribute("class", "carousel_button_left");
		self.left_button.onclick = self.left_button_action;
	
		self.left_arrow = document.createElement("span");
		self.left_arrow.setAttribute("class", "left_symbol");
		self.left_button.appendChild(self.left_arrow);
	
		self.carousel_main.appendChild(self.left_button);
	
	
	
		// Right
		self.right_button = document.createElement("div");
		self.right_button.setAttribute("class", "carousel_button_right");
		self.right_button.onclick = self.right_button_action;

		self.right_arrow = document.createElement("span");
		self.right_arrow.setAttribute("class", "right_symbol");
		self.right_button.appendChild(self.right_arrow);

		self.carousel_main.appendChild(self.right_button);
	
	
	
	
	

	
	
	
	
	
	
		// Functions
		
		// Moves the slider a small amount each time untill it hits the target, if not, recursively repeats
		self.slide = function()
		{		
			//console.log("Target: " + self.target_position);
		
			var offset;
		
			if(px_to_int(self.slider_styles.left) < self.target_position)
			{
				offset = self.offset_width;
			}
			else
			{
				offset = -1 * self.offset_width;
			}
		
			if(px_to_int(self.slider_styles.left) != self.target_position)
			{
				//console.log("Position: " + self.slider_styles.left);
			
				self.slider.style.left = int_to_px(px_to_int(self.slider_styles.left) + offset);
			
				setTimeout(function(){self.slide(slider)}, self.frame_delay);
			}
		}
	
	
		self.left_button_action = function()
		{		
		
			if(self.slider_position > 0)
			{
				self.target_position = (self.slider_position * self.element_width * -1) + self.element_width;
				self.slider_position--;
				self.slide();
			}
			else if (self.slider_position == 0)
			{		
				self.target_position = self.element_width * (self.number_of_elements - 1) * -1;
				self.slider_position = self.number_of_elements - 1;
				self.slide();
			}
		};
	
		self.right_button_action = function()
		{			
			console.log(caller);
		
			if(self.slider_position < self.number_of_elements - 1)
			{
			
				self.target_position = (self.slider_position * self.element_width * -1) - self.element_width;
				self.slider_position++;
				self.slide();
			}
			else if (self.slider_position == self.number_of_elements - 1)
			{
			
				self.target_position = 0;
				self.slider_position = 0;
				self.slide();
			}
		};

	

	
	
	};
	

	
	
	
};







// Initialize carousels
window.addEventListener("load", function()
{
	divs = document.getElementsByTagName("div");
	
	for (var i = 0; i < divs.length; i++)
	{
		if (divs[i].className === "carousel")
		{		
			carousels.push(new Carousel(divs[i]));			
		}
	}

}, false);





// Checks if a DOM node or any of its children (recursively) has a certain class
function has_sub_node_class(root, class_name)
{
	
	
	if(root.className.indexOf(class_name) !== -1) return true;
	else{
		for (child in root.childNodes)
		{

			if(root.childNodes[child].nodeType === 1 && has_sub_node_class(root.childNodes[child], class_name))  // If its a DOM node and it or one of its children has the right class
			{
				return true;
			}
		}
	}
	
	return false;
}








// Converts css pixel value strings to ints
function px_to_int(px)
{
	if(px.indexOf("%") != -1 || px.indexOf("em") != -1 || px.indexOf("px") == -1)
	{
		console.error("px_to_int() requires a string containing a number followed by \"px\"");
		return;
	}
	
	px.replace("px", "");
    return parseInt(px,10);
}





// Converts ints to css pixel value strings
function int_to_px(px)
{
	if(typeof px !== "number")
	{
		console.error("int_to_px() requires a number");
		return;
	}
	
    return px + "px";
}



