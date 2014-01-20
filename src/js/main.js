'use strict';

// explosion defaults
var expDef = {
	minCount: 12,
	maxCount: 22,
	minSize: 6,
	maxSize: 20,
	minDistance: 80,
	maxDistance: 200,
	maxSpread: 120,
	startAngle: 0,
	shapeProb: 0.9
};
$(function() {
	FastClick.attach(document.body);

	if (is_chrome) {
		$('body').prepend(
			'<div class="alt hidden">' + 
			'<h2><span class="left"></span>WEB PROFESSIONAL WORKING IN APPALACHIA<span class="right"></span></h2>' +
			'</div>'
		);
		$('h1').addClass('pointer');
		$('.main').click(function(e){
			$('.alt').removeClass('hidden').delay(3000).queue(function(next) {
				$(this).addClass('hidden');
				next();	
			});
			expDef.startAngle = 0;
			explode('.right');
			expDef.startAngle = 180;
			explode('.left');
		});
	} else {
		$('header').append('<h3>WEB PROFESSIONAL WORKING IN APPALACHIA</h3>');
	}
})

$(window).load(function(){
	$('body').removeClass('bodyHidden');
});



function explode(el) {
	var $el = $(el);
	var count = getRandomInt(expDef.minCount, expDef.maxCount);
	var minAng = expDef.startAngle - (expDef.maxSpread / 2);
	var maxAng = expDef.startAngle + (expDef.maxSpread / 2);

	// cycle through points
	for (var i = 0; i < count; i++) {
		var ang = getRandomInt(minAng, maxAng);
		var dist = getRandomInt(expDef.minDistance, expDef.maxDistance);
		var newPoint = calcNewPoint(dist, ang);
		var size = getRandomInt(expDef.minSize, expDef.maxSize);
		// probability of shape
		var pointStyle = Math.random() < expDef.shapeProb ? '&#59392;' : '&#59393;';
		var spin = (function () {
			var num;
			if (Math.random() < 0.5) {
				num = -Math.abs(getRandomInt (90, 1000));
			} else {
				num = getRandomInt (90, 1000);
			}
			return num;
		})();

		var $point = $('<span class="ex">' + pointStyle + '</span>').css({'font-size': size+'px'});
		if (pointStyle === '&#59393;') {
			$point.css({color: '#FCEE21', '-webkit-text-fill-color': 'currentcolor', 'font-size': '5px'});
		}
		$el.append($point);
		$point.css('top');
		$point.css('left');
		if (pointStyle === '&#59393;') {
			$point.css({'-webkit-transform': 'rotate(' + spin + 'deg)'});
		}
		$point.css({top: newPoint[1], left: newPoint[0], 'font-size': 3+'px', opacity:0});
	}

	//remove all elements after transition finishes
	$(".ex").bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function() {
		this.remove();
	});
}

// utility 
function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function calcNewPoint(dist, ang) {
	var x = dist * Math.cos(ang*Math.PI/180);
	var y = dist * Math.sin(ang*Math.PI/180);
	return [x,y]
}
var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;