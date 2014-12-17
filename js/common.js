$(document).ready(function() {

	document.ontouchmove = function(event) {
		event.preventDefault();
	};

	$("[data-batch]").swipes();

	if($("[data-batch]").length)
		initializeBatches();

	$("[data-toggle]").toggles({

		"main-menu": {

			toggleOnOutsideClick: true
		}
	});

	$("[data-force-batch-scroll]").click( function(e) {

		e.preventDefault();
		var scroll = $.Event("mousewheel");
		var direction = -1;
		if ($(this).data("force-batch-scroll-direction") !== undefined)
			direction = ($(this).data("force-batch-scroll-direction") == "backward" ? 1 : -1);
		if (scroll.originalEvent === undefined) 
			scroll.originalEvent = {};
		scroll.originalEvent.wheelDeltaY = direction;
		$("[data-batch]").trigger(scroll);
	});
});

/* Swipes */

/*! jquery.finger - v0.1.2 - 2014-10-01
* https://github.com/ngryman/jquery.finger
* Copyright (c) 2014 Nicolas Gryman; Licensed MIT */
(function(e,t){function a(t){t.preventDefault(),e.event.remove(T,"click",a)}function n(e,t){return(p?t.originalEvent.touches[0]:t)["page"+e.toUpperCase()]}function r(t,n,r){var o=e.Event(n,b);e.event.trigger(o,{originalEvent:t},t.target),o.isDefaultPrevented()&&(~n.indexOf("tap")&&!p?e.event.add(T,"click",a):t.preventDefault()),r&&(e.event.remove(T,y+"."+D,i),e.event.remove(T,x+"."+D,d))}function o(t){var o=t.timeStamp||+new Date;v!=o&&(v=o,k.x=b.x=n("x",t),k.y=b.y=n("y",t),k.time=o,k.target=t.target,b.orientation=null,b.end=!1,u=!1,l=!1,c=setTimeout(function(){l=!0,r(t,"press")},e.Finger.pressDuration),e.event.add(T,y+"."+D,i),e.event.add(T,x+"."+D,d),w.preventDefault&&(t.preventDefault(),e.event.add(T,"click",a)))}function i(t){if(b.x=n("x",t),b.y=n("y",t),b.dx=b.x-k.x,b.dy=b.y-k.y,b.adx=Math.abs(b.dx),b.ady=Math.abs(b.dy),u=b.adx>w.motionThreshold||b.ady>w.motionThreshold){for(clearTimeout(c),b.orientation||(b.adx>b.ady?(b.orientation="horizontal",b.direction=b.dx>0?1:-1):(b.orientation="vertical",b.direction=b.dy>0?1:-1));t.target&&t.target!==k.target;)t.target=t.target.parentNode;return t.target!==k.target?(t.target=k.target,d.call(this,e.Event(x+"."+D,t)),void 0):(r(t,"drag"),void 0)}}function d(e){var t,a=e.timeStamp||+new Date,n=a-k.time;if(clearTimeout(c),u||l||e.target!==k.target)e.target=k.target,w.flickDuration>n&&r(e,"flick"),b.end=!0,t="drag";else{var o=g===e.target&&w.doubleTapInterval>a-s;t=o?"doubletap":"tap",g=o?null:k.target,s=a}r(e,t,!0)}var u,l,v,c,g,s,m=/chrome/i.exec(t),f=/android/i.exec(t),p="ontouchstart"in window&&!(m&&!f),h=p?"touchstart":"mousedown",x=p?"touchend touchcancel":"mouseup mouseleave",y=p?"touchmove":"mousemove",D="finger",T=e("html")[0],k={},b={},w=e.Finger={pressDuration:300,doubleTapInterval:300,flickDuration:150,motionThreshold:5};e.event.add(T,h+"."+D,o)})(jQuery,navigator.userAgent);

(function( $ ) {
	$.fn.swipes = function(options, callback) {

		// If first argument is function then it is callback, not options
		if (options && typeof(options) == "function")
			var callback = options;

		// If no options defined, options is defined as empty object
		if (!options || options && typeof(options) == "function")
			var options = {};

		return this.each( function() {

			var swipeable = {
				entity: $(this), 
				start: {

				}, 
				properties: $.extend({
					unselectableClass: "g-selectproof"
				}, options)
			}

			$.Finger.motionThreshold = 80;
			$(this).on('drag', function(event) {

				event.preventDefault();

				if (event.orientation == 'vertical' && event.direction > 0)
					$(this).trigger("qbottomswipe");
				else if (event.orientation == 'vertical' && event.direction < 0)
					$(this).trigger("qtopswipe");
				else if (event.orientation == 'horizontal' && event.direction > 0)
					$(this).trigger("qrightswipe");
				else if (event.orientation == 'horizontal' && event.direction < 0)
					$(this).trigger("qleftswipe");

				return;
			});
		});
	};
})(jQuery);


/* Toggles */

(function( $ ) {
	$.fn.toggles = function(options) {

		return this.each( function() {

			var toggle = {
				descriptor: ($(this).data("toggle-descriptor") ? $(this).data("toggle-descriptor") : ""), 
				entity: $(this), 
				on: false, 
				targets: []
			};

			if (!options[toggle.descriptor])
				options[toggle.descriptor] = {};

			toggle.properties = $.extend({
				toggleOnOutsideClick: false
			}, options[toggle.descriptor]);

			if (!options[toggle.descriptor].target)
				toggle.targetDescriptor = toggle.descriptor;
			else
				toggle.targetDescriptor = options[toggle.descriptor].target;

			$("[data-toggle-target][data-toggle-target-descriptor='" + toggle.targetDescriptor + "']").each( function(i) {

				toggle.targets[i] = {

					entity: $(this),
					toggleClass: $(this).data('toggle-target-class')
				}

				$(this).on("toggle", function(event) {

					toggle.on = event.state;
				});
			});

			toggle.entity.click( function(event) {

				if (toggle.properties.activationCondition && !toggle.properties.activationCondition())
					return false;

				event.preventDefault();

				$.each(toggle.targets, function(i, e) {

					e.entity.toggleClass(e.toggleClass);
				});

				if (toggle.on) {

					emittoggle(false);
					if (toggle.properties.toggleOnOutsideClick) {

						$(document).unbind("mouseup").unbind("touchend");
					}
				} else {

					emittoggle(true);

					if (toggle.properties.toggleOnOutsideClick) {

						$(document).on("mouseup touchend", function (event) {

							if (!toggle.on)
								return false;

							var outside = 0;

							$.each(toggle.targets, function(i,e) {

								var container = e.entity;

								if (!container.is(event.target) && container.has(event.target).length === 0) {

									outside += 1;
								}
							});

							if (outside == toggle.targets.length && !toggle.entity.is(event.target) && toggle.entity.has(event.target).length === 0) {

								$.each(toggle.targets, function(i, e) {

									e.entity.toggleClass(e.toggleClass);
								});
								emittoggle(false);
								$(document).unbind("mouseup").unbind("touchend");
							}
						});
					}
				}
			});

			function emittoggle(state) {

				var e = $.Event( "toggle" );
				e.state = state;
				e.bubbles = false;

				$("[data-toggle-target][data-toggle-target-descriptor='" + toggle.descriptor + "']").each(function() {

					$(this).trigger(e);
				});
			}
		});
	};
})(jQuery);

/* Pages */

batches = {};
batchesProperties = {

	"main": {

		forwardDirection: "bottom",
		currentListClass: "b-paged-article-current-section",
		progressTraversedClass: "b-paged-article-pagination-collection-traversed-clause",
		progressCurrentClass: "b-paged-article-pagination-collection-current-clause",
		revealedListClass: "b-paged-article-revealed-section", 
		resizeRebuild: false, 
		minimumScreenWidth: 0
	}
};

batchesActions = {

	"main": {

		first: {

			onShow: function() {
				$(".b-primary-navigation-proceed-link").removeClass("b-primary-navigation-proceed-invisible-link");
				$(".b-contacts-collection").removeClass("b-contacts-invisible-collection");
				$(".b-logo").addClass("b-extended-logo");
			}, 
			onHide: function() {
				$(".b-primary-navigation-proceed-link").addClass("b-primary-navigation-proceed-invisible-link");
				$(".b-contacts-collection").addClass("b-contacts-invisible-collection");
				$(".b-logo").removeClass("b-extended-logo");
			}
		}, 
		last: {

			onShow: function() {
				$(".b-paged-article").addClass("b-paged-finished-article");
			}, 
			onHide: function() {
				$(".b-paged-article").removeClass("b-paged-finished-article");
			}
		}
	},
	"prices": {

		first: {

			onShow: function() { 
				$(".b-pricing-collection").removeClass("b-pricing-kiss");
			},
			onHide: function() { 
				$(".b-pricing-collection").addClass("b-pricing-kiss");
			}
		}
	}
};

function initializeBatches() {

	$("[data-batch]").each(function() {
		
		var batchID = generateIdentificator();
		var batchDescriptor = ($(this).attr("data-batch-descriptor") ? $(this).attr("data-batch-descriptor") : "");
		
		batches[batchID] = {
			
			batch: $(this),
			descriptor: batchDescriptor,
			lists: $(this).children("[data-batch-list]:not([data-batch-delimiter])"),
			currentList: 0,
			progress: $("[data-batch-progress][data-batch-progress-descriptor='" + batchDescriptor + "']"),
			length: $(this).children("[data-batch-list]:not([data-batch-delimiter])").length,
			allItems: $(this).children("[data-batch-list]"),
			totalLength: $(this).children("[data-batch-list]").length,
			locked: false,
			properties: (batchesProperties[batchDescriptor] ? batchesProperties[batchDescriptor] : {})
		};
		
		batches[batchID].batch.attr("data-batch-identificator", batchID);

		setupBatchFlow(batchID);

		batches[batchID].batch.on("mousewheel wheel DOMMouseScroll", function( event ) {

			scrollOnce(batchID, event);
		});

		$(window).on("keyup", function( event ) {

			if (event.keyCode == 39 || event.keyCode == 40) {
				event.preventDefault();
				event.originalEvent.wheelDeltaY = -1;
				flipBatchList(batchID, event);
			} else if (event.keyCode == 37 || event.keyCode == 38) {
				event.preventDefault();
				event.originalEvent.wheelDeltaY = 1;
				flipBatchList(batchID, event);
			}
		});

		batches[batchID].batch.on("qtopswipe", function( event ) {

			event.preventDefault();
			if (!event.originalEvent) event.originalEvent = {};
			event.originalEvent.wheelDeltaY = -1;
			flipBatchList(batchID, event);
		});

		batches[batchID].batch.on("qbottomswipe", function( event ) {

			event.preventDefault();
			if (!event.originalEvent) event.originalEvent = {};
			event.originalEvent.wheelDeltaY = 1;
			flipBatchList(batchID, event);
		});

		batches[batchID].batch.on("turned", function() {

			batches[batchID].locked = false;
		});

		batches[batchID].progress.each( function() {

			$(this).find("[data-batch-progress-step-link]").each( function(index) {

				$(this).click( function(evt) {

					evt.preventDefault();
					if ($(this).data("batch-progress-step-link-list") !== undefined) gotoBatchList(batchID, parseInt($(this).data("batch-progress-step-link-list")), true);
					else gotoBatchList(batchID, index, true);
				});
			});
		});

		if (batches[batchID].properties.resizeRebuild) {

			var batchTimeout;
			var batchCover = false;
			$(window).resize( function( event ) {

				if (batchTimeout) clearTimeout(batchTimeout);
				if (!batchCover) {

					batchCover = $('<div />', {
						class: "b-general-batch-cover"
					});
					batches[batchID].batch.prepend(batchCover);
				}

				batchTimeout = setTimeout( function() {

					setupBatchFlow(batchID);
					batchCover.detach();
					batchCover = false;
				}, 1000);
			});
		}

	});

}

function setupBatchFlow(batchID) {

	batches[batchID].currentList = 0;

	var population = 0;
	for (var i = 0; i < batches[batchID].totalLength; i++) {

		batches[batchID].allItems.eq(i).css("top", population + "%");
		population += Math.round(100 * batches[batchID].allItems.eq(i).height() / batches[batchID].batch.height());
	}

	recordBatchProgress(batchID);
}

function recordBatchProgress(batchID) {

	if(!batches[batchID])
		return false;

	if(batches[batchID].progress.length) {

		var sp = batches[batchID].batch.height();
		var delimiter = batches[batchID].length - 1;
		while (delimiter > 0 && sp - batches[batchID].lists.eq(delimiter - 1).height() > 0) {

			sp = sp - batches[batchID].lists.eq(delimiter - 1).height();
			delimiter--;
		}

		batches[batchID].progress.each( function() {
			$(this).find("[data-batch-progress-step]").each( function(index) {

				if (batches[batchID].currentList <= delimiter) {
					if (index <= batches[batchID].currentList)
						$(this).addClass(batches[batchID].properties.progressTraversedClass);
					else
						$(this).removeClass(batches[batchID].properties.progressTraversedClass);

					if (index == batches[batchID].currentList)
						$(this).addClass(batches[batchID].properties.progressCurrentClass);
					else
						$(this).removeClass(batches[batchID].properties.progressCurrentClass);
				} else {

					if (index <= delimiter)
						$(this).addClass(batches[batchID].properties.progressTraversedClass).removeClass(batches[batchID].properties.progressCurrentClass);
					else
						$(this).addClass(batches[batchID].properties.progressTraversedClass).addClass(batches[batchID].properties.progressCurrentClass);
				}
			});
		});
	}

}

function flipBatchList(batchID, event) {

	if(!batches[batchID])
		return false;

	if(batches[batchID].locked)
		return false;

	var current = batches[batchID].currentList;
	var $current = batches[batchID].lists.eq( current );

	var next = (current + 1 < batches[batchID].length ? current + 1 : (batches[batchID].properties.loop ? 0 : null) );
	var $next = (next !== null ? batches[batchID].lists.eq( next ) : null);
	var prev = (current - 1 >= 0 ? current - 1 : (batches[batchID].properties.loop ? batches[batchID].length - 1 : null) );
	var $prev = (prev !== null ? batches[batchID].lists.eq( prev ) : null);
	var direction = "none";

	var descriptor = batches[batchID].descriptor;

	if (event.originalEvent.wheelDeltaY < 0) {

		direction = "forward";
	} else if (event.originalEvent.wheelDeltaY > 0) {

		direction = "backward";
	}

	if (batches[batchID].properties.revealedListClass && direction == "forward") {

		$current.addClass(batches[batchID].properties.revealedListClass);
		if ($current.data("batch-list-delayed-reveal-additional-class") !== undefined)
			$current.addClass($current.data("batch-list-delayed-reveal-additional-class"));
		if ($current.data("batch-list-delayed-reveal") == true) {

			batches[batchID].locked = true;

			$current.data("batch-list-delayed-reveal", false);
			setTimeout( function() {
				batches[batchID].batch.trigger("turned");
			}, 1000 );
			return false;
		}
	}

	if (direction == "forward" && $next !== null) {
		gotoBatchList(batchID, next);
	} else if (direction == "backward" && $prev !== null) {
		gotoBatchList(batchID, prev);
	} else {
		batches[batchID].batch.trigger("turned");
	}
}

function gotoBatchList(batchID, list, forceGoTo) {

	var duration = 600;

	if(!batches[batchID])
		return false;

	if(batches[batchID].locked)
		return false;
	else
		batches[batchID].locked = true;

	var descriptor = batches[batchID].descriptor;

	var current = batches[batchID].currentList;
	var $current = batches[batchID].lists.eq( current );

	var target = (list < batches[batchID].length ? list : (batches[batchID].properties.loop ? 0 : null) );
	var $target = (target !== null ? batches[batchID].lists.eq( target ) : null);

	var sp = batches[batchID].batch.height();
	var delimiter = batches[batchID].length - 1;
	while (delimiter > 0 && sp - batches[batchID].lists.eq(delimiter - 1).height() > 0) {

		sp = sp - batches[batchID].lists.eq(delimiter - 1).height();
		delimiter--;
	}

	if (target > delimiter) {

		if (!forceGoTo && current > delimiter && current > target)
			target = delimiter;
		else
			target = batches[batchID].length - 1;

		$target = batches[batchID].lists.eq( target );
	}

	if ($target != null && target == batches[batchID].length - 1 && current < batches[batchID].length - 1) {

		var finalstep = Math.round(100 * (parseInt($target.css("top")) - batches[batchID].batch.height() + $target.height() - parseInt($current.css("top"))) / batches[batchID].batch.height());
	}

	if ($current != null && current == batches[batchID].length - 1 && target <= delimiter) {

		var stepcorrection = Math.round(100 * (batches[batchID].batch.height() - $current.height()) / batches[batchID].batch.height());
	}

	if ($target != null && $target.data("batch-list-duration"))
		duration = $target.data("batch-list-duration");

	var step = Math.round(100 * (parseInt($target.css("top")) - parseInt($current.css("top"))) / batches[batchID].batch.height());

	if (finalstep) step = finalstep;
	if (stepcorrection) step += stepcorrection;

	batches[batchID].currentList = target;
	recordBatchProgress(batchID);

	if (batchesActions[descriptor]) {

		if (list == batches[batchID].length - 1 && batchesActions[descriptor].last && batchesActions[descriptor].last.onShow) {
			batchesActions[descriptor].last.onShow();
		} else if (list == 0 && batchesActions[descriptor].first && batchesActions[descriptor].first.onShow) {
			batchesActions[descriptor].first.onShow();
		} else if (batchesActions[descriptor][list] && batchesActions[descriptor][list].onShow) {
			batchesActions[descriptor][list].onShow();
		}

		for (var j = current; (current < list ? j < list : j > list); (current < list ? j++ : j--)) {

			if (j == 0 && batchesActions[descriptor].first && batchesActions[descriptor].first.onHide) {
				batchesActions[descriptor].first.onHide();
			} else if (j == batches[batchID].length - 1 && batchesActions[descriptor].last && batchesActions[descriptor].last.onHide) {
				batchesActions[descriptor].last.onHide();
			} else if (batchesActions[descriptor][j] && batchesActions[descriptor][j].onHide) {
				batchesActions[descriptor][j].onHide();
			}
		}
	}

	var realCurrent = batches[batchID].allItems.index($current);
	var realTarget = batches[batchID].allItems.index($target);

	for (var i = 0; i < batches[batchID].totalLength; i++) {

		if (realCurrent <= realTarget ? i <= realTarget+1 : i >= realTarget) {

			var position = Math.round(100 * parseInt(batches[batchID].allItems.eq(i).css("top")) / batches[batchID].batch.height());

			batches[batchID].allItems.eq(i).animate({
				top: (position - step) + "%"
			}, duration, function() {

				if (batches[batchID].properties.currentListClass) {

					$current.removeClass(batches[batchID].properties.currentListClass);
					$target.addClass(batches[batchID].properties.currentListClass);
				}
			});
		} else {

			var position = Math.round(100 * parseInt(batches[batchID].allItems.eq(i).css("top")) / batches[batchID].batch.height());
			batches[batchID].allItems.eq(i).css("top", (position - step) + "%");
		}
	}

	if (current != target) setTimeout( function() {batches[batchID].batch.trigger("turned");}, duration);
	else batches[batchID].batch.trigger("turned");
}

function scrollOnce(batchID, event) {

	var scrollDelay = 200;

	if(!batches[batchID])
		return false;

	if($(window).width() < batches[batchID].properties.minimumScreenWidth)
		return false;

	event.preventDefault();

	if(!event.originalEvent.wheelDeltaY)
		if(event.originalEvent.deltaY) event.originalEvent.wheelDeltaY = -event.originalEvent.deltaY;

	if(!batches[batchID].longScroll)
		batches[batchID].longScroll = {};
	
	if(!batches[batchID].longScroll.value)
		batches[batchID].longScroll.value = 0;

	if(!batches[batchID].longScroll.locked) {

		batches[batchID].longScroll.locked = true;
		batches[batchID].longScroll.fadeOut = false;
		batches[batchID].longScroll.value = event.originalEvent.wheelDeltaY;
		batches[batchID].longScroll.timeout = setTimeout( resumeScroll, scrollDelay );

		flipBatchList(batchID, event);
	} else {

		if (!scrollContinues( event )) {

			flipBatchList(batchID, event);
		}
		clearTimeout(batches[batchID].longScroll.timeout)
		batches[batchID].longScroll.timeout = setTimeout( resumeScroll, scrollDelay );
	}

	function resumeScroll() {

		batches[batchID].longScroll.locked = false;
		batches[batchID].longScroll.fadeOut = false;
		batches[batchID].longScroll.value = 0;
	}

	function scrollContinues( event ) {

		var sensitivity = 30;
		var continues = true;

		if (batches[batchID].longScroll.value * event.originalEvent.wheelDeltaY < 0) {

			batches[batchID].longScroll.fadeOut = false;
			continues = false;
		} else {

			if (batches[batchID].longScroll.fadeOut) {

				if ( Math.abs(event.originalEvent.wheelDeltaY) > Math.abs(batches[batchID].longScroll.value) ) {

					if ( Math.abs(event.originalEvent.wheelDeltaY) > sensitivity && Math.abs(batches[batchID].longScroll.value) < sensitivity ) {

						batches[batchID].longScroll.fadeOut = false;
						continues = false;
					} else {
						continues = true;
					}
				} else 
					continues = true;
			} else {

				if ( Math.abs(event.originalEvent.wheelDeltaY) < Math.abs(batches[batchID].longScroll.value) ) {
					batches[batchID].longScroll.fadeOut = true;
				}

				continues = true;
			}
		}

		batches[batchID].longScroll.value = event.originalEvent.wheelDeltaY;
		return continues;
	}

}

/* Unsorted */
function executeFunction(name, context) {
	
	var context = context ? context : window;
	var properties = Array.prototype.slice.call(arguments).splice(2, 100);
	var namespaces = name.split(".");
	var func = namespaces.pop();
	
	for(var i = 0; i < namespaces.length; i++) {
		
		context = context[namespaces[i]];
	}
	
	return context[func].apply(this, properties);
}

function getElementPercentageWidth(element) {
	
	var width = element.width();
	var parentWidth = element.offsetParent().width();
	
	return Math.ceil(100 * (width / parentWidth));
}

function getSubstring(string, substringPattern) {
	
	var searchResults = string.match(substringPattern);
	
	return ((searchResults && searchResults[1]) ? searchResults[1] : "");
}

var identificators = {};

function generateIdentificator() {

	var identificator = '';
	var identificatorLength = 10;
	var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var charsetLength = charset.length;

	for (i = 0; identificatorLength > i; i += 1) {
  
		var charIndex = Math.random() * charsetLength;  
		identificator += charset.charAt(charIndex);  
	}
	
	identificator = identificator.toLowerCase();

	if (identificators[identificator])
		return generateIdentificator();

	identificators[identificator] = true;  

	return identificator;
}

var cookiesDomain = "quins.ru";

function createCookie(name, value, days) {

	if (days) {
		
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		var expires = "; expires=" + date.toGMTString();

	} else
		var expires = "";
	
	document.cookie = name + "=" + value + expires + "; path=/" + ((cookiesDomain) ? "; domain=" + cookiesDomain : "");
}

function readCookie(name) {
	
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');

	for(var i = 0; i < ca.length; i++) {

		var c = ca[i];
		
		while (c.charAt(0) == ' ')
			c = c.substring(1,c.length);
		
		if (c.indexOf(nameEQ) == 0)
			return c.substring(nameEQ.length,c.length);
	}

	return "";
}

function eraseCookie(name) {

	createCookie(name, "", -1);
}