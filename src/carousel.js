"use strict";


// Initialize carousels
var carousels = [];
window.addEventListener("load", function()
{
	var carousel_dom = document.getElementsByClassName("carousel");
	
	for (var child in carousel_dom)
	{
		if (carousel_dom.hasOwnProperty(child) && carousel_dom[child].tagName === "DIV")
		{	
			carousels.push(new Carousel(carousel_dom[child]));			
		}
	}

}, false);



function Carousel(reference)
{	
	var self = this;
	
	self.carousel_main = reference;



	self.Sub_carousel_enum = Object.freeze
	({
		PRIMARY: "primary",
		THUMB: "thumb"
	});
	
	
	
	
	
	
	// Config
	
	self.config = new Object();
	
	self.config[self.Sub_carousel_enum.PRIMARY] =  // Default, may be overwritted by config file
	{		
			speed: 10,
			number_of_steps_per_transition: 100
	}
	
	self.config[self.Sub_carousel_enum.THUMB] =  // Default, may be overwritted by config file
	{		
			speed: 5,
			number_of_steps_per_transition: 100
	}


	// Request the config file and load it up
	self.config;
	var xhr = new XMLHttpRequest();
	xhr.open("GET", document.URL + "src/config.json", true);
	xhr.onreadystatechange = function(data)
	{
	    if (xhr.readyState === 4) 
		{
			if(xhr.status === 200)
			{
				self.config = JSON.parse(xhr.responseText);
	
			
				if(typeof self.config.speed === "number") 
					self.speed = self.config.speed;
				
				
				// Number of frames per transition
				if(typeof self.config.transition_time === "number") 
					self.transition_time = self.config.transition_time;
			
				// Number of steps per transition
				if(typeof self.config.number_of_steps_per_transition === "number") 
					self.number_of_steps_per_transition = self.config.number_of_steps_per_transition;
			}
			if(xhr.status === 404)
			{
				console.log("Config file not found. Using defaults");
			}
		}
	}
	xhr.send();
	
	
	
	
	
	
	
	
	
	// Get all the thumbs 
	self.thumbs = new Array();
	for (var child in self.carousel_main.childNodes)
	{	
		if(self.carousel_main.childNodes.hasOwnProperty(child) && 
			self.carousel_main.childNodes[child].nodeType === 1 && 
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
		if (self.thumbs.hasOwnProperty(thumb))
		{
			self.thumb_wrapper.appendChild(self.thumbs[thumb]);
		}
	}
	
	
	// Create primary wrapper and add imgs
	self.primary_wrapper = document.createElement("div"); 
	self.primary_wrapper.setAttribute("class", "primary_wrapper");
	self.carousel_main.insertBefore(self.primary_wrapper, self.thumb_wrapper);
	
	var num_elements;
	for(thumb in self.thumbs)
	{
		if (self.thumbs.hasOwnProperty(thumb))
		{
			var link_node = get_sub_node(self.thumbs[thumb], "A")
			if(link_node)
			{
				num_elements++;
				
				var new_img = document.createElement("img");
				new_img.setAttribute("src", link_node.href);
				new_img.setAttribute("class", "primary_image");
				self.primary_wrapper.appendChild(new_img);	

				// Delete the thumb's link now that its no longer neeed
				var image = get_sub_node(link_node, "IMG")
				var parent = link_node.parentNode
				parent.appendChild(image);
				parent.removeChild(link_node);
					
			}
			else
			{
				console.error("Error: The following thumbnail does not have a link to the full-size image", self.thumbs[thumb]);
			}
		}
	}

	
	
	
	
	// Create sub-carousel objects which do the rest
	self.sub_carousels = new Array();
	
	self.primary_carousel = new Sub_carousel(self, self.primary_wrapper, self.Sub_carousel_enum.PRIMARY, self.config[self.Sub_carousel_enum.PRIMARY].speed, self.config[self.Sub_carousel_enum.PRIMARY].number_of_steps_per_transition);
	self.sub_carousels.push(self.primary_carousel);

	
	self.thumb_carousel = new Sub_carousel(self, self.thumb_wrapper, self.Sub_carousel_enum.THUMB, self.config[self.Sub_carousel_enum.THUMB].speed, self.config[self.Sub_carousel_enum.THUMB].number_of_steps_per_transition);
	self.sub_carousels.push(self.thumb_carousel);


	
	





	self.animate_sibling = function(event, caller, index)
	{
		if(caller === self.Sub_carousel_enum.THUMB)
		{
			self.primary_carousel.animate_to_index(index);
		}
	}







	function Sub_carousel(outer_object, outer_div, name, spd, num_steps)
	{
		var self = this;

		
		self.speed = spd;
		self.number_of_steps_per_transition = num_steps;

		// Get list of element contents (needs to be before mask and slider to avoid including them)
		self.elements_content = new Array()
		self.number_of_elements = 0;
		for(var child in outer_div.childNodes)
		{
			
			if(outer_div.childNodes.hasOwnProperty(child) && 
				outer_div.childNodes[child].nodeType === 1)
			{			
				self.number_of_elements++;
				self.elements_content.push(outer_div.childNodes[child]);
				outer_div.childNodes[child].onclick = function(event)
				{
					outer_object.animate_sibling(event, name, self.elements_content.indexOf(event.target));
				}
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
		for(var child in self.elements_content)
		{			
			if(self.elements_content.hasOwnProperty(child))
			{
				var element = document.createElement("div");
				element.setAttribute("class", name + "_"  + "slider_element");
			
				element.appendChild(self.elements_content[child]);
				self.elements.push(element);
			
				self.slider.appendChild(element);	
			}
		}

		// Get some numbers, do some calculations

		self.slider_styles = window.getComputedStyle(self.slider);

		
		self.slider_position = 0; // Which element's being pointed at. multiply by element_width to get offset, and -1 for movement to left (right button).
		self.target_position = 0; // Which element is being, or is intended to be, displayed; changed *before* animation begins; 0 indexed
		
	

		self.element_width = self.elements[0].offsetWidth;
		self.frame_size = Math.floor(px_to_float(self.slider_styles.width) / self.element_width)// Number of elements on display at once
		//self.step_delay = outer_object.transition_time / outer_object.number_of_frames_per_transition;	// constant time
		self.step_delay = 0; // will be determined in animate_to_index;
	
	
	
		// Button and Movement Functions
		
		// Moves the slider a small amount each time untill it hits the target, if not, recursively repeats
		self.slide = function()
		{	
			/*	
			console.log("Position: " + self.slider_styles.left);
			console.log("Target: " + self.target_position);
			*/
				
			if(Math.abs(px_to_float(self.slider_styles.left) - self.target_position) > Math.abs(self.offset_width))
			{
				self.slider.style.left = float_to_px(px_to_float(self.slider_styles.left) + self.offset_width);
				setTimeout(function(){self.slide()}, self.step_delay);
			}
			else // We're going to overshoot, but we're close enough that we can just go directly
			{
				self.slider.style.left = self.target_position;
			}
		}
	
		self.animate_to_index = function(index)
		{

			if(index < 0 || index > self.number_of_elements) return;
			self.target_position = self.element_width * index * -1;
			self.slider_position = index;

			self.offset_width = (self.target_position - px_to_float(self.slider_styles.left)) / self.number_of_steps_per_transition;
			
			self.step_delay = ((Math.abs(self.target_position - px_to_float(self.slider_styles.left))) / (self.speed)) / self.number_of_steps_per_transition // constant speed
			

			/*
			console.log("target_position: " + self.target_position);
			console.log("slider_styles.left: " + px_to_float(self.slider_styles.left));
			console.log("offset width: " + self.offset_width);
			console.log("Index: " + index);
			*/
			
			self.slide();
		};
	
		self.left_button_action = function()
		{		
			var index = 0;
			
			if(self.slider_position > 0) // Normal move
			{
				index = self.slider_position - self.frame_size;
				if(index < 0) index = 0;
			}
			else if (self.slider_position == 0)  // Moving past the end loops
			{		
				index = self.number_of_elements - self.frame_size;
			}
			
			self.animate_to_index(index);
		};
	
		self.right_button_action = function()
		{					
			var index = 0;
			
			if(self.slider_position < self.number_of_elements - self.frame_size) // Normal move
			{
				index = self.slider_position + self.frame_size;
				if(index >= self.number_of_elements - self.frame_size) index = self.number_of_elements - self.frame_size;
			}
			else if (self.slider_position >= self.number_of_elements - self.frame_size) // Moving past the end loops
			{
				index = 0;
			}
			
			self.animate_to_index(index);
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


// Returns the first DOM node (it or its children [recursively]) that has a certain tag
function get_sub_node(root, node_name)
{
	if(root.nodeType !== 1)
	{
		console.error("get_sub_node requires a DOM node")
		return;
	}
	
	if(root.nodeName === node_name) return root;
	else{
		for (var child in root.childNodes)
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
	if(root.nodeType !== 1)
	{
		console.error("get_sub_node requires a DOM node")
		return;
	}
	
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
function px_to_float(px)
{
	if(px.indexOf("%") != -1 || px.indexOf("em") != -1 || px.indexOf("px") == -1)
	{
		console.error("px_to_float() requires a string containing a number followed by \"px\"");
		return;
	}
	
	px.replace("px", "");
    return parseFloat(px,10);
}





// Converts ints to css pixel value strings
function float_to_px(px)
{
	if(typeof px !== "number")
	{
		console.error("float_to_px() requires a number");
		return;
	}
	
    return px + "px";
}



