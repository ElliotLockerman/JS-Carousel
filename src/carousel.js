var carousels = [];

function Carousel(element)
{	
	var _this = this;
	
	_this.reference = element;

	_this.slider = _this.reference.children[0].children[0]; // Eventually, loop through and get by class name
	_this.slider_styles = window.getComputedStyle(_this.slider);
	_this.number_of_elements = this.slider.children.length; // Eventually, loop through and get by class name

	_this.element_width = 600; // Eventually should be automatic - same width as mask, not as elements
	_this.slider_position = 0; // Which element's being pointed at. multiply by element_width to get offset, and -1 for movement to left (right button).
	_this.transition_time = 10; // Default, may be overwritted by config file
	_this.number_of_frames_per_transition = 40; // Default, may be overwritted by config file
	_this.frame_delay = this.transition_time / _this.number_of_frames_per_transition;	
	_this.offset_width = _this.element_width / _this.number_of_frames_per_transition;
	_this.target_position = 0; // Which element is being, or is intended to be, displayed; changed *before* animation begins; 0 indexed

	
	
	
	

	

	_this.slide = function()
	{		
		//console.log("Target: " + _this.target_position);
		
		var offset;
		
		if(px_to_int(_this.slider_styles.left) < _this.target_position)
		{
			offset = _this.offset_width;
		}
		else
		{
			offset = -1 * _this.offset_width;
		}
		
		if(px_to_int(_this.slider_styles.left) != _this.target_position)
		{
			//console.log("Position: " + _this.slider_styles.left);
			
			_this.slider.style.left = int_to_px(px_to_int(_this.slider_styles.left) + offset);
			
			setTimeout(_this.slide, _this.frame_delay);
		}
	}
	
	
	_this.left_button_action = function()
	{		
		
		
		if(_this.slider_position > 0)
		{
			_this.target_position = (_this.slider_position * _this.element_width * -1) + _this.element_width;
			_this.slider_position--;
			_this.slide();
		}
		else if (_this.slider_position == 0)
		{		
			_this.target_position = _this.element_width * (_this.number_of_elements - 1) * -1;
			_this.slider_position = _this.number_of_elements - 1;
			_this.slide();
		}
	};
	
	_this.right_button_action = function()
	{			

		
		if(_this.slider_position < _this.number_of_elements - 1)
		{
			
			_this.target_position = (_this.slider_position * _this.element_width * -1) - _this.element_width;
			_this.slider_position++;
			_this.slide();
		}
		else if (_this.slider_position == _this.number_of_elements - 1)
		{
			
			_this.target_position = 0;
			_this.slider_position = 0;
			_this.slide();
		}
	};

	
	//create buttons
	// Left
	_this.left_button = document.createElement("div");
	_this.left_button.setAttribute("class", "carousel_button_left");
	_this.left_button.onclick = _this.left_button_action;
	
	_this.left_arrow = document.createElement("span");
	_this.left_arrow.setAttribute("class", "triangle_left");
	_this.left_button.appendChild(_this.left_arrow);
	
	_this.reference.appendChild(_this.left_button);
	
	
	
	// Right
	_this.right_button = document.createElement("div");
	_this.right_button.setAttribute("class", "carousel_button_right");
	_this.right_button.onclick = _this.right_button_action;

	_this.right_arrow = document.createElement("span");
	_this.right_arrow.setAttribute("class", "triangle_right");
	_this.right_button.appendChild(_this.right_arrow);

	_this.reference.appendChild(_this.right_button);
	
	
	

	// Request the config file; if we get it, load it up
	var xhr = new XMLHttpRequest();
	xhr.open("GET", document.URL + "/src/config.json", true);
	xhr.onreadystatechange = function(data)
	{
	    if (xhr.readyState == 4) 
		{
			config = JSON.parse(xhr.responseText);
			
			
			
			
			if(typeof config.button_position !== "undefined")
			{
				
				switch(config.button_position)
				{
					case "outside":						
						_this.left_button.style.left = "0px";
						_this.right_button.style.right = "0px";
						break;
						
					case "inside":						
						_this.left_button.style.left = window.getComputedStyle(_this.left_button).width;
						_this.right_button.style.right = window.getComputedStyle(_this.right_button).width;
						break;
						
					case "manual":
						break;
					default:
						console.error("Illegal Value, button_position: " + config.button_position);
						break;	
				}
			}
			else // default
			{
				_this.left_button.style.left = "0px";
				_this.right_button.style.right = "0px";
			}
			
			
			
			
			
			if(typeof config.transition_time !== "undefined") _this.transition_time = config.transition_time;


			if(typeof config.number_of_frames_per_transition !== "undefined") _this.number_of_frames_per_transition = config.number_of_frames_per_transition;
					
					

		
		
			// Re-do some calculations from before, in case the default values were overwritten
			_this.frame_delay = _this.transition_time / _this.number_of_frames_per_transition;
			_this.offset_width = _this.element_width / _this.number_of_frames_per_transition;	
		}
	}
	xhr.send();
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

function int_to_px(px)
{
	if(typeof px !== "number")
	{
		console.error("int_to_px() requires a number");
		return;
	}
	
    return px + "px";
}



