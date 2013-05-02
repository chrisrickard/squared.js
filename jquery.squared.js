// squared 0.0002
// chris.rickard@gmail.com
(function($) {
	$.fn.squared = function(options) {
		// build main options before element iteration
		var opts = $.extend({}, $.fn.squared.defaults, options);
		var _sqxoffset, _sqyoffset;

		return this.each(function() {
			//reset any square offsets...
			_sqxoffset = _sqyoffset = 0;

			var container = this;
			//if image dimensions has been supplied
			if(opts.dimensions.w && opts.dimensions.h) {
				_initialize(container);
			}
			else {
				//otherwise, we need to retrieve the image for the width & height...
				var img = new Image();
				img.onload = function() { _initialize(container, img); };
				img.src = opts.src;
			}
		});

		/**
		 * Initialize
		 */
		function _initialize(container, img) {
			//retrieve image dimensions...
			//(either from img, or opts.dimensions if supplied)
			var imgdata = _getImageData(img);

			//calculate real square size (taking itno account size, offset and borer)...
			var square_size = (opts.squaresize + opts.squareoffset + (opts.border.width * 2));
			//calculate the container size...
			var container_width = (imgdata.x.times * square_size) - opts.squareoffset + "px";
			var container_height = (imgdata.y.times * square_size) - opts.squareoffset + "px";

			$(container).css({
				"position": "relative",
				"background-color": opts.bgcolor,
				"width": container_width,
				"height": container_height,
				"overflow": opts.overflow
			});

			//create our squares..
			_createSquares(imgdata, container);
		}

		/**
		* create the image squares
		*/
		function _createSquares(imgdata, container) {
			var imgcount = 1;
			for(x = 0; x < imgdata.x.times; x++) {
				var xpos = opts.squaresize * x;
				for(y = 0; y < imgdata.y.times; y++) {
					var ypos = opts.squaresize * y;
					//create the single square
					_createSquare(xpos, ypos, container, imgdata, y, x, imgcount);
					imgcount++;
				}
			}
		}

		/**
		* create a single image square
		*/
		function _createSquare(xpos, ypos, container, imgdata, row, column, imgcount) {
			var square = document.createElement("div");
			square.className = "square";
			container.appendChild(square);

			var xpos_offset = xpos;
			var ypos_offset = ypos;

			//add offest to position if supplied...
			if(opts.squareoffset > 0) {
				_sqyoffset = _sqyoffset || 0;

				if(_sqyoffset >= imgdata.y.times) {
					_sqyoffset = 1 ;
				}
				else {
					_sqyoffset++;
				}

				ypos_offset = ypos + (_sqyoffset * opts.squareoffset) - opts.squareoffset;
				_sqxoffset = _sqxoffset || 0;
				if(_sqyoffset == 1) _sqxoffset++;
				xpos_offset = xpos + (_sqxoffset * opts.squareoffset) - opts.squareoffset;
			}

			//add border to position if supplied (and square isn't flush against the container)
			if(opts.border.width > 0) {
				xpos_offset += (column * opts.border.width * 2);
				ypos_offset += (row * opts.border.width * 2);
			}

			//set css styling to square...
			$(square).css({
				"background-image": "url('" + opts.src + "')",
				"background-repeat": "no-repeat",
				"background-position": "-" + xpos + "px -" + ypos + "px",
				"position": "absolute",
				"width": opts.squaresize,
				"height": opts.squaresize,
				"top": ypos_offset,
				"left": xpos_offset
			});

			//add border if supplied..
			if(opts.border.width > 0) {
				square.style.border = opts.border.width + "px " + opts.border.style + " " + opts.border.color;
			}

			//add border radius if supplied..
			if(opts.border.radius) {
				$(square).css({
					"-moz-border-radius": opts.border.radius + "px",
					"-webkit-border-radius":opts.border.radius + "px",
					"border-radius":opts.border.radius + "px"
				});
			}

			//if we are fading the image in...
			if(opts.fadetime > 0) {
				//set image fully transparent
				$(square).css({"opacity": 0});
				//fade in imade, fadetime + any fade offset...
				$(square).fadeTo(opts.fadetime + (imgcount * opts.fadeoffset) , 1);
			}


			//if we have a post renderer defined, invoke it...
			if(opts.post_renderer) {
				opts.post_renderer(square, xpos, ypos);
			}
		}

		/**
		* return image data in the following format:
		* {x: {repeats: int, remainder int}, y: {repeats: int, remainder int}}
		* where 'times' is the amount of times to draw asquare on the axis,
		* and remainder is the amount of remaining pixels.
		*/
		function _getImageData(img) {
			//either use predefined img dimensions, or the images actual dimensions...
			var width = opts.dimensions.w || img.width;
			var height = opts.dimensions.h || img.height;

			return {
				x: {times: (Math.ceil(width / opts.squaresize)), remainder: (width % opts.squaresize)},
				y: {times: (Math.ceil(height / opts.squaresize)), remainder: (height % opts.squaresize)}
			};
		}
	};

	//defaults...
	$.fn.squared.defaults = {
		src: null,
		dimensions: {},
		backgroundcolor: null,
		border: {width: 0, style: null, color: null},
		squaresize: 100,
		squareoffset: 0,
		fadetime: 0,
		fadeoffset: 0,
		overflow: "hidden",
		post_renderer: null
	};
})(jQuery);