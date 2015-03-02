# Config.json Properties and Valid Values


- "button_position"
	- "outside" 
		- Buttons are to the left and right of the element
	- "overlay"
		- Buttons are laid over the element. May require changing the button's opacity.
	- "manual" (default)
		- Set position manually with CSS
		- The default setting is equivalent to "outside" in initial position, but unlike the other two settings, it can be overwritten with a theme's CSS.
- "transition_time"
	- number, time in milliseconds (default: 10)
		- Total length of time it takes to move to target
		- Time does not depend on number of elements to move across - if you click the button twice, it will move twice as quickly, because it has to move twice as far during the same transition_time
- number_of_frames_per_transition
	- number, integer (default: 40)
		- number of frames between one element and the next

