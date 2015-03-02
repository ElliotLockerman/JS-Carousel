function add_header()
{
    header = document.createElement("h1");
    header_text = document.createTextNode(document.title);
    header.appendChild(header_text);
    document.body.appendChild(header);
}

function populate_TOC(list_id)
{
	document.addEventListener("DOMContentLoaded", function () {
	
		var songs = document.getElementsByTagName("h2");
		var toc = document.getElementById(list_id);

		for (var i = 0; i < songs.length; i++)
		{
			if(songs[i].className == "song_title")
            {
    			var name = songs[i].innerHTML;
    			songs[i].setAttribute("id", encodeURIComponent(name));
		
    			item = document.createElement("LI");
    			link = document.createElement("a");
    			link.setAttribute("href", "#" + encodeURIComponent(name))
    			link.innerHTML = name;
			
    			item.appendChild(link);
    			toc.appendChild(item);
            }
		}
	
	}, false);
}


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
	_this.transition_time = 10;
	_this.number_of_frames = 40;
	_this.frame_delay = this.transition_time / _this.number_of_frames;
	_this.offset_width = _this.element_width / _this.number_of_frames;
	_this.target_position = 0;

	
	
	
	

	

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
			
			console.log(typeof config.button_position !== "undefined");
			
			if(typeof config.button_position !== "undefined")
			{
				console.log("control was here");
				
				switch(config.button_position)
				{
					case "outside":
						console.log("outside");
						
						_this.left_button.style.left = "0px";
						_this.right_button.style.right = "0px";
						
						break;
						
					case "inside":
						console.log("inside");
						
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
    px.replace("px", "")
    return parseInt(px,10);
}

function int_to_px(px)
{
    return px + "px";
}



