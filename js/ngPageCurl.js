(function () {

	'use strict';

	angular
		.module('ngPageCurl', [])

		.factory('utils', [function () {

			var factory = {
				captureMouse: captureMouse,
				intersects: intersects,
				rad: rad,
				deg: deg
			}

			function captureMouse(element) {
				var mouse = {
					x: 0,
					y: 0
				}

				element.addEventListener('mousemove', function (event) {
					var x;
					var y;

					if (event.pageX || event.pageY) {
						x = event.pageX;
						y = event.pageY;
					} else {
						x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
						y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
					}

					x -= element.offsetLeft;
					y -= element.offsetTop;

					mouse.x = x;
					mouse.y = y;
				}, false);

				return mouse;
			}

			function intersects(rectA, rectB) {
				return !(rectA.x + rectA.w < rectB.x || rectB.x + rectB.w < rectA.x || rectA.y + rectA.h < rectB.y || rectB.y + rectB.h < rectA.y);
			}

			function rad(deg) {
				return deg * Math.PI / 180;
			}

			function deg(rad) {
				return rad * 180 / Math.PI;
			}

			return factory;
		}])

		.directive('pageCurl', ['$window', 'utils', function ($window, utils) {

			var directive = {
				restrict: 'EA',
				link: link
			}

			var faces = document.querySelectorAll('.book .container').length;
			var angle = 45;

			var page = {
				width: null,
				height: null,
				spine: null,
				edge: null
			}

			var line = {
				x: null,
				rotation: null
			}

			var offsetX = 0;
			var offsetY = 0;

			function link(scope, el, attrs, ctrl) {
				set(el);
				addEvents(el);
			}

			function set(el) {
				page.width = el[0].clientWidth / faces;
				page.height = el[0].clientHeight;
				page.spine = el[0].clientWidth - page.width;
				page.edge = page.spine + page.width;

				// set starting point
				var corner = 50;
				setLineRotation(page.edge - corner);
				applyMask();
			}

			function addEvents(el) {
				var mouse = utils.captureMouse(el[0]);

				el.on('mousedown', function (event) {
					// offsetX = event.offsetX;
					// offsetY = event.offsetY;
					angular.element($window).on('mouseup', onMouseUp);
					angular.element($window).on('mousemove', onMouseMove);
				});

				function onMouseUp() {
					angular.element($window).off('mousemove');
					angular.element($window).off('mouseup');
				}

				function onMouseMove() {
					var x = mouse.x - offsetX;
					var y = mouse.y - offsetY;

					setLineRotation(x);
					applyMask();
				}
			}

			function setLineRotation(x) {
				line.x = x;

				if (line.x > page.edge) {
					line.x = page.edge;
				} else if (line.x < page.spine) {
					line.x = page.spine;
				}

				line.rotation = angle * (line.x - page.spine) / page.width;
			}

			function applyMask() {
				// SOHCAHTOA
				var adj = line.x - page.width;
				var opp = Math.tan(utils.rad(line.rotation)) * adj;
				var hyp = Math.sqrt(adj * adj + opp * opp);

				var gapX = Math.abs(hyp) - Math.abs(adj);

				TweenLite.set('.mask.left', {
					width: page.width,
					height: page.height * 1.2,
					x: line.x - gapX,
					rotation: line.rotation,
					transformOrigin: 'bottom left',
					force3D: true
				});

				TweenLite.set('.mask.right', {
					width: page.width,
					height: page.height * 1.2,
					x: -(page.edge - line.x) - gapX,
					rotation: line.rotation,
					transformOrigin: 'bottom right',
					force3D: true
				});

				TweenLite.set('.mask.left .page', {
					x: -line.x,
					y: opp,
					rotation: -line.rotation,
					transformOrigin: 'bottom right',
					force3D: true
				});

				TweenLite.set('.mask.right .page', {
					x: line.x,
					y: opp,
					rotation: line.rotation,
					transformOrigin: 'bottom left',
					force3D: true
				});
			}

			return directive;
		}])

})();
