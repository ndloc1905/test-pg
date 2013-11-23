var SWIPEMODULE = (function(my, $, options){
	var _setting = {
		swipeContainer: 'swipeContainer',
		swipeList: 'swipeList',
		swipeItem: 'item',
		swipeNavActive: 'active',
		swipeNav: 'swipeNav',
		itemInGroup: 4,
		swipeTime: 500,
		nextClass: 'hoverNext',
		hoverClass: 'hover'
	},

	_dom = {
		$swipeContainer: null
	};

	function createHTMLElement($element, attributes) {
		for (var key in attributes) {
			if (attributes.hasOwnProperty(key)) {
				$element.attr(key, attributes[key]);
			}
		}
		return $element;
	}

	function createLiTag(attributes) {
		return createHTMLElement($('<li></li>'), attributes);
	}

	function swipeTouch() {
		$.each(_dom.$swipeContainer, function() {
			var parent = this,
				$this = $(parent);

			parent._setting = {
				swipeList: _setting.swipeList,
				swipeItem: _setting.swipeItem,
				swipeNav: _setting.swipeNav,
				swipeNavActive: _setting.swipeNavActive, 
				itemWidth: 0,
				itemInGroup: _setting.itemInGroup,
				swipeItemLength: 0,
				isTouchLeft: false,
				swipeTime: _setting.swipeTime,
				currentMargin: 0,
				nextClass: 'hoverNext',
				hoverClass: 'hover',
				begin: null,
				delta: null,
				move: null,
				swipeCurrent: 0,
				isSwiping: false,
			},

			parent._dom = {
				$swipeList: null,
				$swipeItem: null
			};

			parent.initiate = function() {
				parent._dom.$swipeList = $this.find('.' + parent._setting.swipeList);
				parent._dom.$swipeItem = $this.find('.' + parent._setting.swipeItem);
				parent._dom.$swipeNav = $this.find('.' + parent._setting.swipeNav);
				parent._setting.swipeItemLength = parent._dom.$swipeItem.length;
				parent._setting.itemWidth = parent._dom.$swipeItem.first().outerWidth();

				//Initiate the neccessary value before swipe
				parent.setup();

				parent.createNav();
			}

			parent.setup = function() {
				/*Nothing for swipe*/
				if (parent._setting.swipeItemLength < parent._setting.itemInGroup) {
					return;
				}
				$this.css({'width': parent._setting.itemWidth * parent._setting.itemInGroup});
				parent._dom.$swipeList.css({
					'width': parent._setting.itemWidth * parent._setting.swipeItemLength,
					'margin-left': '0px'
				});
			}

			parent.createNav = function() {
				var liTag,
					len = Math.floor(parent._dom.$swipeItem.length / parent._setting.itemInGroup),
					i = 0;

				if (parent._dom.$swipeItem.length > 0 && parent._dom.$swipeItem.length < parent._setting.itemInGroup) {
					len = 1;
				} else if ((len * parent._setting.itemInGroup) < parent._dom.$swipeItem.length) {
					len = len + 1;
				}

				for (i; i < len; i++) {
					if (i === 0) {
						liTag = createLiTag({'class': parent._setting.swipeNavActive});
					} else {
						liTag = createLiTag();
					}
					parent._dom.$swipeNav.append(liTag);
				}
			}

			parent.touchDirection = function(deltaCoor) {
				if (deltaCoor) {
					if (deltaCoor.x > 0) {
						parent._setting.isTouchLeft = true;
					}
					else if (deltaCoor.x < 0) {
						parent._setting.isTouchLeft = false;
					}
				}
				//console.log(_setting.isTouchLeft);
			}

			parent.translateSwipe = function($element, value) {
				if ($element) {
					$element.css('margin-left', value);
				}
			}

			parent.marginAfterAnimate = function() {
				var margin = parent._dom.$swipeList.css('margin-left').replace('px', '');
				if (margin) {
					margin = Number(margin);
				}
				return margin;
			}

			parent.marginLeftLeft = function(margin) {
				var marginLeft = '-=',
					swipeTo = 0,
					swipeOnceValue = (parent._setting.itemWidth * parent._setting.itemInGroup),
					step = (parent._setting.itemWidth * parent._setting.itemInGroup);

				if (parent._setting.isTouchLeft) {
					marginLeft = '+=';
					swipeTo = Math.abs(Math.abs(parent._setting.swipeCurrent) - swipeOnceValue);
					if ((Math.abs(swipeTo) === swipeOnceValue) && (parent._setting.swipeCurrent === 0)) {
						swipeOnceValue = -(Math.abs(parent._setting.currentMargin) - Math.abs(parent._setting.swipeCurrent));
					} else {
						swipeOnceValue = Math.abs(Math.abs(margin) - swipeTo);	
					}
				} else {
					swipeTo = parent._setting.swipeCurrent - swipeOnceValue;
					if (Math.abs(swipeTo) >= parent._setting.itemWidth * parent._setting.swipeItemLength) {
						swipeOnceValue = -(Math.abs(parent._setting.currentMargin) - Math.abs(parent._setting.swipeCurrent));
					} else {
						swipeOnceValue = Math.abs(margin - swipeTo);
					}
				}
				//console.log('margin left: ' + swipeOnceValue);
				marginLeft += swipeOnceValue;

				return marginLeft;
			}

			parent.doSwipe = function(margin) {
				var marginLeft = parent.marginLeftLeft(margin);

				parent._dom.$swipeList.animate({ 'margin-left': margin }, 0);

				parent._dom.$swipeList.animate({ 'margin-left': marginLeft }, parent._setting.swipeTime, function() {
					parent._setting.currentMargin = parent.marginAfterAnimate();
					parent._setting.swipeCurrent = parent._setting.currentMargin;

					parent.swipeNavSelected(parent._setting.swipeCurrent);

					//console.log('current: ' + parent._setting.swipeCurrent);
					/*Finish swipe process*/
					parent._setting.isSwiping = false;
				});
			}

			parent.swipeNavSelected = function(margin) {
				var $navItem = parent._dom.$swipeNav.find('li'),
					i = 0,
					step = (parent._setting.itemWidth * parent._setting.itemInGroup),
					position = Math.abs(margin / step);

				$navItem.removeClass(parent._setting.swipeNavActive);
				$($navItem[position]).addClass(parent._setting.swipeNavActive);
			}

			parent.initiate();
	
			parent._touchMethod = {
				handleEvent: function(event) {
					switch(event.type) {
						case 'touchstart': this.touchStart(event); break;
						case 'touchmove': this.touchMove(event); break;
						case 'touchend': this.touchEnd(event); break;
					}
				},

				touchStart: function(event) {
					var touch = event.touches[0];
					
					parent._setting.begin = {
						x: touch.pageX,
						y: touch.pageY,
					};

					parent._setting.move = parent._setting.begin.x;
				},

				touchMove: function(event) {
					event.preventDefault();
					var touch = event.touches[0];
					
					parent._setting.isSwiping = true;

					parent._setting.delta = {
						x: touch.pageX - parent._setting.begin.x,
						y: touch.pageY - parent._setting.begin.y,
					}

					parent._setting.currentMargin += (touch.pageX - parent._setting.move);

					parent._setting.move = touch.pageX;
					parent.translateSwipe(parent._dom.$swipeList, parent._setting.currentMargin);
				},

				touchEnd: function(event) {
					if (parent._setting.isSwiping) {
						parent.touchDirection(parent._setting.delta);

						parent.doSwipe(parent._setting.currentMargin);
					}
				}
			}

			if (parent._setting.swipeItemLength > parent._setting.itemInGroup) {
				parent.addEventListener('touchstart', parent._touchMethod, false);
				parent.addEventListener('touchmove', parent._touchMethod, false);
				parent.addEventListener('touchend', parent._touchMethod, false);
			}
		});
	}
	

	my.init = function(options) {
		_setting = $.extend({}, _setting, options);
		
		_dom.$swipeContainer = $('.' + _setting.swipeContainer);

		swipeTouch();
	}

	return my;

}(SWIPEMODULE || {}, jQuery));