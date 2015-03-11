"use strict";


// Initialize carousels
var carousels = [];
window.addEventListener("load", function()
{
	var divs = document.getElementsByTagName("div");
	
	for (var i = 0; i < divs.length; i++)
	{
		if (divs[i].className === "carousel")
		{		
			carousels.push(new Carousel(divs[i]));			
		}
	}

}, false);



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
	
	for(var thumb in self.thumbs)
	{
		self.thumb_wrapper.appendChild(self.thumbs[thumb]);
	}
	
	
	// Create primary wrapper and add imgs
	self.primary_wrapper = document.createElement("div"); 
	self.primary_wrapper.setAttribute("class", "primary_wrapper");
	self.carousel_main.insertBefore(self.primary_wrapper, self.thumb_wrapper);
	
	for(thumb in self.thumbs)
	{
		var link_node = get_sub_node(self.thumbs[thumb], "A")
		if(link_node)
		{
			var new_img = document.createElement("img");
			new_img.setAttribute("src", link_node.href);
			link_node.href="javascript:;"; // The javascript will handle the clicks	
			new_img.setAttribute("class", "primary_image");
			self.primary_wrapper.appendChild(new_img);			
		}
		else
		{
			console.error("Error: The following thumbnail does not have a link to the full-size image", self.thumbs[thumb]);
		}
	}
	
	
	
	
	// Create sub-carousel objects which do the rest
	self.sub_carousels = new Array();
	
	self.primary_carousel = new Sub_carousel(self, self.primary_wrapper, "primary");
	self.sub_carousels.push(self.primary_carousel);
	
	self.thumb_carousel = new Sub_carousel(self, self.thumb_wrapper, "thumb");
	self.sub_carousels.push(self.thumb_carousel);





	self.animate_sibling = function(caller, index)
	{

	}







	function Sub_carousel(outer_object, outer_div, name)
	{
		var self = this;


		// Get list of element contents (needs to be before mask and slider to avoid including them)
		var elements_content = new Array()
		self.number_of_elements = 0;
		for(var child in outer_div.childNodes)
		{
			
			if(outer_div.childNodes.hasOwnProperty(child) && 
				outer_div.childNodes[child].nodeType === 1)
			{			
				elements_content.push(outer_div.childNodes[child]);
				self.number_of_elements++;
			}
		}
		
		
	

		// Create mask and slider
		var mask = document.createElement("div");
		mask.setAttribute("class", name + "_"  + "mask");
		outer_div.appendChild(mask);

		self.slider = document.createElement("div");
		self.slider.setAttribute("class", name + "_"  + "slider");
		mask.appendChild(self.slider);
	
	
		
		
		// Wrap images in element divs and add to slider
		self.elements = new Array();
		for(var child in elements_content)
		{			
			var element = document.createElement("div");
			element.setAttribute("class", name + "_"  + "slider_element");
			element.onclick = function(event)
			{
				console.log(event.target);
				outer_object.animate_sibling(event, name, self.elements.indexOf(event.target));
			}
			element.appendChild(elements_content[child]);
			self.elements.push(element);
			
			self.slider.appendChild(element);	
		}

		// Get some numbers, do some calculations

		self.slider_styles = window.getComputedStyle(self.slider);

		self.element_width = self.elements[0].offsetWidth;
		self.offset_width = self.element_width / outer_object.number_of_frames_per_transition;
		self.frame_delay = outer_object.transition_time / outer_object.number_of_frames_per_transition;	

		self.slider_position = 0; // Which element's being pointed at. multiply by element_width to get offset, and -1 for movement to left (right button).
		self.target_position = 0; // Which element is being, or is intended to be, displayed; changed *before* animation begins; 0 indexed
		
		

		
		

	
	
	
		// Button and Movement Functions
		
		// Moves the slider a small amount each time untill it hits the target, if not, recursively repeats
		self.slide = function()
		{		
			console.log("Target: " + self.target_position);
		
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
			
				setTimeout(function(){self.slide()}, self.frame_delay);
			}
		}
	
		self.animate_to_index = function(index)
		{
			
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

	

		//create buttons
		// Left
		var left_button = document.createElement("div");
		left_button.setAttribute("class", name + "_"  + "button_left");
		left_button.onclick = self.left_button_action;
	
		var left_arrow = document.createElement("span");
		left_arrow.setAttribute("class", name + "_"  + "left_symbol");
		left_button.appendChild(left_arrow);
	
		outer_div.appendChild(left_button);
	
	
	
		// Right
		var right_button = document.createElement("div");
		right_button.setAttribute("class", name + "_"  + "button_right");
		right_button.onclick = self.right_button_action;

		var right_arrow = document.createElement("span");
		right_arrow.setAttribute("class", name + "_"  + "right_symbol");
		right_button.appendChild(right_arrow);

		outer_div.appendChild(right_button);
	
	
	
	
	};
	

	
	
	
};













// Functions


// Checks if a DOM node or any of its children (recursively) has a certain tag
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



// Checks if a DOM node or any of its children (recursively) has a certain class
function has_sub_node_class(root, class_name)
{
	
	
	if(root.className.indexOf(class_name) !== -1) return true;
	else{
		for (var child in root.childNodes)
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



