$(document).ready(function() {

	if($("[data-batch]").length)
		initializeBatches();
});

/* Pages */

batches = {};
batchesProperties = {

	"main": {

		forwardDirection: "bottom",
		currentListClass: "b-paged-article-current-section",
		progressTraversedClass: "b-progress-traversed-clause",
		minimumScreenWidth: 1000
	}
};

batchesActions = {

	"main": {
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
				batchesActions[descriptor].first.onHide();
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
			}, duration);
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

/* Rotators */
var rotators = {};
var rotatorsProperties = {

	"project": {
	
		animation: "displaying"
	}
};

function initializeRotators() {
	
	$("[data-rotator]").each(function() {

		var rotatorID = generateIdentificator();
		var rotatorDescriptor = ($(this).attr("data-rotator-descriptor") ? $(this).attr("data-rotator-descriptor") : "");
		
		rotators[rotatorID] = {
			
			rotator: $(this),
			descriptor: rotatorDescriptor,
			articles: $(this).find("[data-rotator-article]"),
			articleWidth: $(this).find("[data-rotator-article]").eq(0).width(),
			articlesCount: $(this).find("[data-rotator-article]").length,
			articlesDistance: (parseInt($(this).find("[data-rotator-article]").last().css("marginLeft")) ? parseInt($(this).find("[data-rotator-article]").last().css("marginLeft")) : 0),
			articlesRepository: ($(this).find("[data-rotator-articles-repository]").length ? $(this).find("[data-rotator-articles-repository]") : $(this)),
			articlesRepositoryWidth: ($(this).find("[data-rotator-articles-repository]").length ? $(this).find("[data-rotator-articles-repository]").width() : $(this).width()),
			rollers: {

				backward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']") : null),
				forward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']") : null)
			},
			rollersTitles: {
				
				backward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']").find("[data-rotator-roller-title]").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='backward']").find("[data-rotator-roller-title]") : null),
				forward: ($(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']").find("[data-rotator-roller-title]").length ? $(this).find("[data-rotator-roller][data-rotator-roller-descriptor='forward']").find("[data-rotator-roller-title]") : null)
			},
			currentPosition: 0,
			positionsPoints: ($(this).find("[data-rotator-points-article]").length ? $(this).find("[data-rotator-points-article]") : null),
			positionsPointsRepository: $(this).find("[data-rotator-points]"),
			currentPositionsPoint: $(this).find("[data-rotator-points-article][data-rotator-points-article-descriptor='current']"),
			indicator: ($(this).find("[data-rotator-indicator]").length ? $(this).find("[data-rotator-indicator]") : null),
			indicatorPosition: ($(this).find("[data-rotator-indicator-position]").length ? $(this).find("[data-rotator-indicator-position]") : null),
			indicatorQuantity: ($(this).find("[data-rotator-indicator-quantity]").length ? $(this).find("[data-rotator-indicator-quantity]") : null),
			paused: false,
			automationPaused: true,
			properties: (rotatorsProperties[rotatorDescriptor] ? rotatorsProperties[rotatorDescriptor] : {})
		}
		
		rotators[rotatorID].articlesRepository.scrollLeft(0);
		
		rotators[rotatorID].rotator.attr("data-rotator-identificator", rotatorID);
		
		if(rotators[rotatorID].indicatorPosition)
			rotators[rotatorID].indicatorPosition.text(rotators[rotatorID].currentPosition + 1);
			
		if(rotators[rotatorID].indicatorQuantity)
			rotators[rotatorID].indicatorQuantity.text(rotators[rotatorID].articlesCount);
		
		rotators[rotatorID].viewedArticlesCount = Math.ceil(rotators[rotatorID].articlesRepositoryWidth / (rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance));
		
		if(rotators[rotatorID].rollers.backward) {
			
			rotators[rotatorID].rollers.backward.click(function(event) {

				event.preventDefault();
				rotators[rotatorID].automationPaused = true;
				turnRotator(rotatorID, "backward");
			});
		}
		
		if(rotators[rotatorID].rollers.forward) {
			
			if(rotators[rotatorID].properties.rollersDisabledClass && rotators[rotatorID].articlesCount > rotators[rotatorID].viewedArticlesCount)
				rotators[rotatorID].rollers.forward.toggleClass(rotators[rotatorID].properties.rollersDisabledClass);
			
			rotators[rotatorID].rollers.forward.click(function(event) {

				event.preventDefault();
				rotators[rotatorID].automationPaused = true;
				turnRotator(rotatorID, "forward");
			});
		}
		
		if(rotators[rotatorID].properties.swipe) {
			
			rotators[rotatorID].swipeStatus = false;
			rotators[rotatorID].swipePositions = {};
			
			rotators[rotatorID].rotator.on("touchstart mousedown", function (e) {
				
				rotators[rotatorID].swipeStatus = true;
				rotators[rotatorID].swipePositions = {
					
					x: e.originalEvent.pageX,
					y: e.originalEvent.pageY
				};
			});

			rotators[rotatorID].rotator.on("touchend mouseup", function (e) {
				
				rotators[rotatorID].swipeStatus = false;
				rotators[rotatorID].swipePositions = null;
			});
			
			rotators[rotatorID].rotator.on( "touchmove mousemove", function (e) {
								
				if (!rotators[rotatorID].swipeStatus)
					return;
					
				if(Math.abs(getSwipeInformation(e, rotators[rotatorID].swipePositions).offset.x) > (rotators[rotatorID].articleWidth / 3)) {
					
					turnRotator(rotatorID, (getSwipeInformation(e, rotators[rotatorID].swipePositions).direction.x == "left" ? "forward" : "backward"));
					
					rotators[rotatorID].swipePositions = {
					
						x: e.originalEvent.pageX,
						y: e.originalEvent.pageY
					};
				}
				
				e.preventDefault();
			});
		}

		if(rotators[rotatorID].positionsPoints) {

			rotators[rotatorID].positionsPoints.each( function( index ) {

				$(this).children("[data-rotator-points-article-link]").click( function(evt) {

					evt.preventDefault();
					hurlRotator(rotatorID, index);
				});
			})
		}
		
		if(rotators[rotatorID].properties.automation) {

			rotators[rotatorID].automationPaused = false;
			rotators[rotatorID].automationID = setInterval( function() {

				if (!rotators[rotatorID].automationPaused)
					turnRotator(rotatorID, 'forward');

			}, rotators[rotatorID].properties.automationInterval);
		} 

		if(rotators[rotatorID].properties.automation) {
			rotators[rotatorID].rotator.find(".b-promos-article-title, .b-promos-article-description").mouseenter( function() {
				rotators[rotatorID].automationPaused = true;
			}).mouseleave( function() {
				rotators[rotatorID].automationPaused = false;
			});
		}
	
		if(rotators[rotatorID].properties.initializeFunction)
			executeFunction(rotators[rotatorID].properties.initializeFunction, null, rotatorID);
	});
}

function turnRotator(rotatorID, direction) {

	if(rotators[rotatorID].properties.animation == "conveyor") {
		
		if(rotators[rotatorID].descriptor != "photos")
			var animation = { scrollLeft: ((direction == "forward") ? "+" : "-") + "=" + (rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance)};
		else
			var animation = { left: ((direction == "forward") ? "-" : "+") + "=" + (rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance)};
		
		if(rotators[rotatorID].properties.cycle) {
		
			if(direction == "backward") {
			
				rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":last").clone(true).prependTo(rotators[rotatorID].articlesRepository);
				rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":last").remove();
				
				rotators[rotatorID].articlesRepository.scrollLeft((rotators[rotatorID].articleWidth + rotators[rotatorID].articlesDistance));
				
				rotators[rotatorID].articlesRepository.stop(true, true).animate(animation, 350);
			
			} else {
				
				rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":first").clone(true).appendTo(rotators[rotatorID].articlesRepository);
								
				rotators[rotatorID].articlesRepository.stop(true, true).animate(animation, 350, function() {

					rotators[rotatorID].rotator.find("[data-rotator-article]").filter(":first").remove();
					rotators[rotatorID].articlesRepository.scrollLeft(0);
				});
				
			}

		} else {
		
			
			if((direction == "forward" && rotators[rotatorID].currentPosition < (rotators[rotatorID].articlesCount - rotators[rotatorID].viewedArticlesCount)) || (direction == "backward" && rotators[rotatorID].currentPosition > 0))
				rotators[rotatorID].articlesRepository.stop(true, true).animate(animation, 350);
			else
				return false;
		}

		rotators[rotatorID].currentPosition = ((direction == "forward") ? (rotators[rotatorID].currentPosition + 1) : (rotators[rotatorID].currentPosition - 1));
		
		if(rotators[rotatorID].properties.articlesCurrentClass) {
			
			rotators[rotatorID].articles.removeClass(rotators[rotatorID].properties.articlesCurrentClass);
			rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).addClass(rotators[rotatorID].properties.articlesCurrentClass);
		}
			
		
		if(rotators[rotatorID].properties.rollersDisabledClass && ((rotators[rotatorID].currentPosition > 0 && rotators[rotatorID].rollers.backward.hasClass(rotators[rotatorID].properties.rollersDisabledClass)) || (rotators[rotatorID].currentPosition == 0 && !rotators[rotatorID].rollers.backward.hasClass(rotators[rotatorID].properties.rollersDisabledClass))))
			rotators[rotatorID].rollers.backward.toggleClass(rotators[rotatorID].properties.rollersDisabledClass);

		if(rotators[rotatorID].properties.rollersDisabledClass && ((rotators[rotatorID].currentPosition < (rotators[rotatorID].articlesCount - rotators[rotatorID].viewedArticlesCount) && rotators[rotatorID].rollers.forward.hasClass(rotators[rotatorID].properties.rollersDisabledClass)) || (rotators[rotatorID].currentPosition == (rotators[rotatorID].articlesCount - rotators[rotatorID].viewedArticlesCount) && !rotators[rotatorID].rollers.forward.hasClass(rotators[rotatorID].properties.rollersDisabledClass))))
			rotators[rotatorID].rollers.forward.toggleClass(rotators[rotatorID].properties.rollersDisabledClass);
		
	} else if(rotators[rotatorID].properties.animation == "displaying") {
		
		if(!rotators[rotatorID].paused) {
			
			rotators[rotatorID].paused = true;
			
			if(rotators[rotatorID].rotator.find("[data-rotator-background]").length)
				rotators[rotatorID].rotator.find("[data-rotator-background]").fadeOut(350);
		
			rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).animate({ opacity: 0 }, 350, function() {
			
				$(this).addClass("g-hidden");
			
				if(direction == "forward")
					rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0);
				else
					rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1));
					
				if(rotators[rotatorID].indicatorPosition)
					rotators[rotatorID].indicatorPosition.text(rotators[rotatorID].currentPosition + 1);
					
				if(rotators[rotatorID].rollersTitles.backward || rotators[rotatorID].rollersTitles.forward) {
					
					rotators[rotatorID].rollersTitles.forward.text(rotators[rotatorID].articles.eq((((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0)).data("rotator-article-title"));
					rotators[rotatorID].rollersTitles.backward.text(rotators[rotatorID].articles.eq((((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1))).data("rotator-article-title"));
				}
				
				if(rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url")) {
				
					//$("[data-rotator-background]").attr("class", "b-promos-rotated-previews-background b-promos-rotated-previews-" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).attr("data-rotator-article-descriptor") + "-background").fadeIn(350);
					rotators[rotatorID].rotator.find("[data-rotator-background]").css({ backgroundImage: "url(" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url") + ")" }).fadeIn(350);
				}
			
				rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).css("opacity", "0").removeClass("g-hidden").animate({ opacity: 1 }, 350);
			
				if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {

					rotators[rotatorID].currentPositionsPoint
						.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.removeAttr("data-rotator-positions-point-descriptor");

					rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
						.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.attr("data-rotator-positions-point-descriptor", "current");

					rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
				}
				
				rotators[rotatorID].paused = false;
			
				return true;
			});
		}
	
	} else if(rotators[rotatorID].properties.animation == "swipe") {
		
		
		
	} else if(!rotators[rotatorID].properties.animation || rotators[rotatorID].properties.animation == "simple") {
		
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).addClass("g-hidden");
			
		if(direction == "forward")
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0);
		else
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1));
			
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).removeClass("g-hidden");
	}
	
	if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {
		
		rotators[rotatorID].currentPositionsPoint
			.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.removeAttr("data-rotator-positions-point-descriptor");
		
		rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
			.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.attr("data-rotator-positions-point-descriptor", "current");
		
		rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
	}
	
}

function hurlRotator(rotatorID, articleCounter) {

	if(rotators[rotatorID].properties.animation == "displaying") {
		
		if(!rotators[rotatorID].paused) {
			
			rotators[rotatorID].paused = true;
			
			if(rotators[rotatorID].rotator.find("[data-rotator-background]").length)
				rotators[rotatorID].rotator.find("[data-rotator-background]").fadeOut(350);
		
			rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).animate({ opacity: 0 }, 350, function() {
			
				$(this).addClass("g-hidden");
			
				rotators[rotatorID].currentPosition = (((articleCounter) < rotators[rotatorID].articlesCount) ? (articleCounter) : 0);
					
				if(rotators[rotatorID].indicatorPosition)
					rotators[rotatorID].indicatorPosition.text(articleCounter);
					
				if(rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url")) {
				
					//$("[data-rotator-background]").attr("class", "b-promos-rotated-previews-background b-promos-rotated-previews-" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).attr("data-rotator-article-descriptor") + "-background").fadeIn(350);
					$("[data-rotator-background]").css({ backgroundImage: "url(" + rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).data("rotator-article-background-url") + ")" }).fadeIn(350);
				}
			
				rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).css("opacity", "0").removeClass("g-hidden").animate({ opacity: 1 }, 350);
			
				if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {

					rotators[rotatorID].currentPositionsPoint
						.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.removeAttr("data-rotator-positions-point-descriptor");

					rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
						.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
						.attr("data-rotator-positions-point-descriptor", "current");

					rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
				}
				
				rotators[rotatorID].paused = false;
			
				return true;
			});
		}
	
	} else if(rotators[rotatorID].properties.animation == "swipe") {
		
		
		
	} else if(!rotators[rotatorID].properties.animation || rotators[rotatorID].properties.animation == "simple") {
		
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).addClass("g-hidden");
			
		if(direction == "forward")
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition + 1) < rotators[rotatorID].articlesCount) ? (rotators[rotatorID].currentPosition + 1) : 0);
		else
			rotators[rotatorID].currentPosition = (((rotators[rotatorID].currentPosition - 1) >= 0) ? (rotators[rotatorID].currentPosition - 1) : (rotators[rotatorID].articlesCount - 1));
			
		rotators[rotatorID].articles.eq(rotators[rotatorID].currentPosition).removeClass("g-hidden");
	}
	
	if(rotators[rotatorID].positionsPoints && rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass) {
		
		rotators[rotatorID].currentPositionsPoint
			.toggleClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.removeAttr("data-rotator-positions-point-descriptor");
		
		rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition)
			.addClass(rotators[rotatorID].properties.positionsPointsCurrentAdditionalClass)
			.attr("data-rotator-positions-point-descriptor", "current");
		
		rotators[rotatorID].currentPositionsPoint = rotators[rotatorID].positionsPoints.eq(rotators[rotatorID].currentPosition);
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