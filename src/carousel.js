


// Initialize carousels
var carousels = [];
window.addEventListener("load", function()
{"use strict";
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
{"use strict";	
	var self = this;
	
	var carousel_main = reference;



	var Sub_carousel_enum = Object.freeze
	({
		PRIMARY: "primary",
		THUMB: "thumb"
	});
	
	
	
	
	
	
	// Config
	var config = {};
	config[Sub_carousel_enum.PRIMARY] =  
	{		
			speed: 100, // From end-to-end, in pixels per ms
			number_of_steps_per_transition: 100 
	};
	
	config[Sub_carousel_enum.THUMB] = 
	{		
			speed: 2, // From end-to-end, in pixels per ms
			number_of_steps_per_transition: 100
	};



	
	
	
	// Get all the thumbs 
	var thumbs = [];
	for (var child in carousel_main.childNodes)
	{	
		if(carousel_main.childNodes.hasOwnProperty(child) && 
			carousel_main.childNodes[child].nodeType === 1 && 
			has_sub_node_class(carousel_main.childNodes[child], "thumb_image")) // If its a DOM node and it or one of its children has the right class
		{		
				thumbs.push(carousel_main.childNodes[child]);
		}
		
	}
	

	
	// Wrap the thumbs
	var thumb_wrapper = document.createElement("div"); 
	thumb_wrapper.setAttribute("class", "thumb_wrapper");
	carousel_main.appendChild(thumb_wrapper);
	
	for(var thumb in thumbs)
	{
		if (thumbs.hasOwnProperty(thumb))
		{
			thumb_wrapper.appendChild(thumbs[thumb]);
		}
	}
	
	
	// Create primary wrapper and add imgs
	var primary_wrapper = document.createElement("div"); 
	primary_wrapper.setAttribute("class", "primary_wrapper");
	carousel_main.insertBefore(primary_wrapper, thumb_wrapper);
	
	var num_elements = 0;
	for(thumb in thumbs)
	{
		if (thumbs.hasOwnProperty(thumb))
		{
			var link_node = get_sub_node(thumbs[thumb], "A");
			if(link_node)
			{
				// Create the full size image
				var new_img = document.createElement("img");
				new_img.setAttribute("src", link_node.href);
				new_img.setAttribute("class", "primary_image");
				primary_wrapper.appendChild(new_img);	

				// Delete the thumb's link now that its no longer neeed
				var image = get_sub_node(link_node, "IMG");
				var parent = link_node.parentNode;
				parent.appendChild(image);
				parent.removeChild(link_node);
				image.setAttribute("data-index", num_elements);
				
				num_elements++;	
			}
			else
			{
				console.error("Error: The following thumbnail does not have a link to the full-size image", thumbs[thumb]);
			}
		}
	}

	
	
	






	self.thumb_click = function(index)
	{

		sub_carousels[Sub_carousel_enum.PRIMARY].animate_to_index(index);
	
	};


	self.primary_alert_position_change = function(index)
	{
		sub_carousels[Sub_carousel_enum.THUMB].set_selected(index);
		
		if(index <  sub_carousels[Sub_carousel_enum.THUMB].slider_position || 
			index >  sub_carousels[Sub_carousel_enum.THUMB].slider_position + sub_carousels[Sub_carousel_enum.THUMB].frame_size - 1)
		{
			sub_carousels[Sub_carousel_enum.THUMB].animate_to_index(index);
		}
	
	};




	
	// Create sub-carousel objects which do the rest
	var sub_carousels = {};
	
	sub_carousels[Sub_carousel_enum.PRIMARY] = new Sub_carousel(self, primary_wrapper, Sub_carousel_enum.PRIMARY, config[Sub_carousel_enum.PRIMARY].speed, config[Sub_carousel_enum.PRIMARY].number_of_steps_per_transition, function(){return;}, self.primary_alert_position_change);

	
	sub_carousels[Sub_carousel_enum.THUMB] = new Sub_carousel(self, thumb_wrapper, Sub_carousel_enum.THUMB, config[Sub_carousel_enum.THUMB].speed, config[Sub_carousel_enum.THUMB].number_of_steps_per_transition, self.thumb_click, function(){return;});


	
	





	function Sub_carousel(outer_object, outer_div, name, spd, num_steps, on_click, on_position_change)
	{
		var self = this;

		
		var speed = spd;
		var number_of_steps_per_transition = num_steps;

		// Get list of element contents (needs to be before mask and slider to avoid including them)
		self.element_click = function(event)
		{
			on_click(parseInt(event.target.getAttribute("data-index")));
		};
		var elements_content = [];
		var number_of_elements = 0; 
		for(var child in outer_div.childNodes)
		{
			
			if(outer_div.childNodes.hasOwnProperty(child) && 
				outer_div.childNodes[child].nodeType === 1)
			{			
				number_of_elements++;
				elements_content.push(outer_div.childNodes[child]);
				outer_div.childNodes[child].onclick = self.element_click;
			}
		}
		
		
	

		// Create mask and slider
		var mask = document.createElement("div");
		mask.setAttribute("class", name + "_"  + "mask");
		outer_div.appendChild(mask);

		var slider = document.createElement("div");
		slider.setAttribute("class", name + "_"  + "slider");
		mask.appendChild(slider);
	
	
		
		
		// Wrap images in element divs and add to slider
		var elements = [];
		for(child in elements_content)
		{			
			if(elements_content.hasOwnProperty(child))
			{
				var element = document.createElement("div");
				element.setAttribute("class", name + "_"  + "slider_element");
			
				element.appendChild(elements_content[child]);
				elements.push(element);
			
				slider.appendChild(element);	
			}
		}

		// Get some numbers, do some calculations

		var slider_styles = window.getComputedStyle(slider);

		
		self.slider_position = 0; // Which element's being pointed at. multiply by element_width to get offset, and -1 for movement to left (right button).
		var target_position = 0; // Which element is being, or is intended to be, displayed; changed *before* animation begins; 0 indexed
		
	

		var element_width = elements[0].offsetWidth;
		self.frame_size = Math.floor(px_to_float(slider_styles.width) / element_width); // Number of elements on display at once; MUST BE PRIVILEGED
		if(self.frame_size > number_of_elements ) self.frame_size = number_of_elements;
			
		//step_delay = outer_object.transition_time / outer_object.number_of_frames_per_transition;	// constant time
		var step_delay = 0; // will be determined in animate_to_index
		var step_width = 0; // will be determined in animate_to_index; Note that this is the width of the 
		
	
	
	
		var currently_selected = 0;
		self.set_selected = function(index)
		{
			elements_content[currently_selected].className = elements_content[currently_selected].className.replace(name + "_image_selected", "");
			elements_content[index].className = elements_content[index].className + " " + name + "_image_selected";
			currently_selected = index;
		}
		self.set_selected(0);
	




	
		// Button and Movement Functions
		
		// Moves the slider a small amount each time untill it hits the target, if not, recursively repeats
		var slide = function()
		{

			/*
			console.log("Position: " + slider_styles.left);
			console.log("Target: " + target_position);
			*/
				
			if(Math.abs(px_to_float(slider_styles.left) - target_position) >= Math.abs(step_width))
			{
				slider.style.left = float_to_px(px_to_float(slider_styles.left) + step_width);
				setTimeout(function(){slide();}, step_delay);
			}
			else // We're going to overshoot, but we're close enough that we can just go directly
			{
				slider.style.left = float_to_px(target_position);
				//console.log("Position: " + slider_styles.left);
			}
		};
	
		self.animate_to_index = function(index) // MUST BE PRIVILEGED
		{		

			if(index < 0) index = 0;
			if(index > number_of_elements - self.frame_size) index = number_of_elements - self.frame_size;
	
			target_position = element_width * index * -1;
			self.slider_position = index;

			step_width = (target_position - px_to_float(slider_styles.left)) / number_of_steps_per_transition;
			
			step_delay = ((Math.abs(target_position - px_to_float(slider_styles.left))) / (speed)) / number_of_steps_per_transition; // constant speed
			
			on_position_change(index);

			/*
			console.log("target_position: " + target_position);
			console.log("slider_styles.left: " + px_to_float(slider_styles.left));
			console.log("offset width: " + step_width);
			console.log("Index: " + index);
			*/
			
			slide();
		};
	
		self.left_button_action = function()
		{		
			var index = 0;
			
			if(self.slider_position > 0) // Normal move
			{
				index = self.slider_position - self.frame_size;
				if(index < 0) index = 0;
			}
			else if (self.slider_position === 0)  // Moving past the end loops
			{		
				index = number_of_elements - self.frame_size;
			}
			
			self.animate_to_index(index);
		};
	
		self.right_button_action = function()
		{					
			var index = 0;
			
			
			if(self.slider_position < number_of_elements - self.frame_size) // Normal move
			{
				index = self.slider_position + self.frame_size;
				if(index >= number_of_elements - self.frame_size) index = number_of_elements - self.frame_size;
			}
			else if (self.slider_position >= number_of_elements - self.frame_size) // Moving past the end loops
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
	
	
	
	
	}
	

	
	
	
}













// Functions


// Returns the first DOM node (it or its children [recursively]) that has a certain tag
function get_sub_node(root, node_name)
{"use strict";
	if(root.nodeType !== 1)
	{
		console.error("get_sub_node requires a DOM node");
		return;
	}
	
	if(root.nodeName === node_name) return root;
	else{
		for (var child in root.childNodes)
		{
			if(root.childNodes[child].nodeType === 1) // If its a DOM node
			{
				return get_sub_node(root.childNodes[child], node_name);
			}
		}
	}
	
	return false;
}



// Checks if a DOM node or any of its children (recursively) has a certain class
function has_sub_node_class(root, class_name)
{"use strict";
	if(root.nodeType !== 1)
	{
		console.error("get_sub_node requires a DOM node");
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
{"use strict";
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
{"use strict";
	if(typeof px !== "number")
	{
		console.error("float_to_px() requires a number");
		return;
	}
	
    return px + "px";
}



