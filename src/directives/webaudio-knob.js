'use strict';

function log2(num) {
	var log=Math.log(num) / Math.LN2;
	return log;
} 

const WebaudioKnob = function($timeout, $window) {
 return {
        restrict: 'E',
        scope: {
            value:'=',
            units: '@',
            log: '@',
            defaultValue: '@',
            min: '@',
            max: '@',
            step: '@',
            sprites: '@',
            diameter: '@',
            width: '@',
            height: '@',
            sensitivity: '@',
            src: '@',
            valuetip: '@',
            disable: '@',            
            onChange: '&'
        },
        template: require('../views/controls/webaudio-control'),
        bindToController: true,
        controllerAs: 'vm',
        controller: function () { 
            this.setValue = (value) => {
                
                // here we set the value on the controller
                //self.viewvalue = val;
				value = parseFloat(value);
				
				if(!isNaN(value)) {
					this.value = value < parseFloat(this.min) ? parseFloat(this.min) : value > parseFloat(this.max) ? parseFloat(this.max) : value;
					
					var valueNumber = (this.log) ? Math.pow(2,this.value) : this.value;
					
					this.viewValue = valueNumber;
					this.valuedisp = valueNumber.toFixed(this.digits);
					if ((this.digits===0)&&(valueNumber>1000)) {
						valueNumber = valueNumber/1000;
						// between 1k and 10k - show two digits, else show one
						this.valuedisp = valueNumber.toFixed((valueNumber<10)?2:1) + "k";
					} 
				}
            };
            
        },
        link: function(scope, elem, attrs, ngModelCtrl) {     
            
            var timeoutPromise = null;
			var knb = elem[0].querySelector('#wac-knob');
			
			var cancel = function(e) {
                var ctrl = scope.vm;

				showtip();
				ctrl.startPosX = ctrl.startPosY = ctrl.lastShift = null;
				$window.removeEventListener('touchmove', pointermove, true);
				$window.removeEventListener('mousemove', pointermove, true);
				$window.removeEventListener('mouseup', cancel, true);
				$window.removeEventListener('touchend', cancel, true);
				$window.removeEventListener('touchcancel', cancel, true);
			};
			
            function redraw() {
                
                var ctrl = scope.vm;
                
				var range = ctrl.max - ctrl.min;
				if(ctrl.sprites) {
					var offset = ~~(ctrl.sprites * (ctrl.value - ctrl.min) / range) * ctrl.height;
					ctrl.knobStyle.backgroundPosition = "0px -" + offset + "px";
					ctrl.knobStyle.transform = 'rotate(0deg)';
				}
				else {
					var deg = 270*((ctrl.value-ctrl.min)/range-0.5);
					ctrl.knobStyle.transform = 'rotate('+deg+'deg)';
				}                
            }
            
            function showtip() {
                scope.vm.tooltipIsOpen = true;
                scope.$apply();
            
                if(timeoutPromise !== null)
                    $timeout.cancel(timeoutPromise);
                    
                    
                timeoutPromise = $timeout(function() {
                    scope.vm.tooltipIsOpen = false;
                    scope.$apply();
                }, 1500);
                
                timeoutPromise.then(function() {
                    timeoutPromise = null;
                }, function(e) {
					// eat the error
				});
            }
            
            var pointerdown = function(e) {
            	
            	var ctrl = scope.vm;
            	
				if(!ctrl.enable)
					return;
					
				if(e.touches)
					e = e.touches[0];

				if(e.ctrlKey || e.metaKey) {
					ctrl.setValue(parseFloat(ctrl.defvalue));
				}
				else {
					ctrl.startPosX = e.pageX;
					ctrl.startPosY = e.pageY;
					ctrl.startVal = ctrl.value;
					$window.addEventListener('mousemove', pointermove, true);
					$window.addEventListener('touchmove', pointermove, true);
				}
				
				$window.addEventListener('mouseup', cancel, true);
				$window.addEventListener('touchend', cancel, true);
				$window.addEventListener('touchcancel', cancel, true);

				scope.$apply();
				
				showtip();
				e.preventDefault();            	
            };
           
            
            function pointerover(e) {
               scope.vm.tooltipIsOpen = true;
               scope.$apply();                
            }
            
            function pointerout(e) {
               scope.vm.tooltipIsOpen = false;
               scope.$apply();                
                
            }
            
			var pointermove = function(e) {

				e.preventDefault();
				
			    var ctrl = scope.vm;
			    
			    var shiftKey = e.shiftKey;
				if(e.touches)
					e = e.touches[0];
			    
			    if(ctrl.lastShift !== shiftKey) {
					ctrl.lastShift = shiftKey;
					ctrl.startPosX = e.pageX;
					ctrl.startPosY = e.pageY;
					ctrl.startVal = ctrl.value;
				}
				
				var offset = (ctrl.startPosY - e.pageY - ctrl.startPosX + e.pageX) * ctrl.sensitivity;
				
				var newValue = ctrl.min + ((((ctrl.startVal + (ctrl.max - ctrl.min) * offset / ((shiftKey ? 4:1) * 128)) - ctrl.min) / ctrl.ctlStep)|0) * ctrl.ctlStep;
				var oldValue = ctrl.value;

	            ctrl.setValue(newValue);
	            
    			scope.$apply();
				redraw();
				
				showtip();

				if(ctrl.value != oldValue && typeof(ctrl.onChange) === 'function') {
				    ctrl.onChange();
				}				
			};
			
            function wheel(e) {

				if(!ctrl.enable)
					return;
					
				var delta = 0;
				if(e.wheelDelta)
					delta = e.wheelDelta/120;
				else if(e.detail)
					delta = -e.detail/3;
				if(e.shiftKey)
					delta *= 0.2;
				delta *= (parseFloat(scope.vm.max) - parseFloat(scope.vm.min)) * 0.05;
				
				console.log('scope.vm.step', scope.vm.step);

				if(Math.abs(delta) < parseFloat(scope.vm.step)) {
					delta = (delta>0)?parseFloat(scope.vm.step):-parseFloat(scope.vm.step);
				}
				
				var newValue = parseFloat(scope.vm.value) + delta;
				var oldValue = scope.vm.value;
				
				scope.vm.setValue(newValue);
				
				scope.$apply();
				if(scope.vm.value != oldValue && typeof(scope.vm.onChange) === 'function') {
				    scope.vm.onChange();
				    redraw();
				}
				
				showtip();
				
				e.preventDefault();                
            }
            
            var ctrl = scope.vm;

            knb.addEventListener('DOMMouseScroll', wheel, true);         
            knb.addEventListener('mousewheel', wheel, true);
		    knb.addEventListener('mouseout',pointerout,false);
            knb.addEventListener('mouseover',pointerover,false);
            
            elem.on('mousedown', pointerdown);
            elem.on('touchstart', pointerdown);
            
            var src = attrs.src;
            if(!src) {
                src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAACg0lEQVR42u2bvW7CMBCAwwswMCB14AUQb8BjsHbKUqljngClW16gUxkYeQXmTrRTXqEjTCiiGYJ7iS5SlAZIgu98wbH0CWTxc3ex785n23Ho2wRYAD6wAXbADxABCRJh3w4/4+N3Jk5H2xwIgBBQdxLib82lKz0EPE1KXzOGh/8lSnEfh3FtZcbAMzJubogI/9O4IV6BQ9MnOQW+gWgwyPgCpu1GxAFlYG8zYNt2KL+Bwkd4PSNH7LtjamxRJpbmouduLfAKiAGFxNh3p39IUDbSFuhwZkQGyAmolF/r8uapsr8w5HMDpO9XeqPFWrfyG53h7AMUjgs+IMY+zSFzI+7JV02Bs/4poHUkBARCUfsAbT7BpcroilNA0U2BIm6bOJ9QCVSeAgROsCpENsoTtoTCZE+7HAWIR0CeLNVObxW1ARiiQBU30+Zhm9xecBSoWjtcXUD5DEKod+BUGAEn7HN48K89/YhDiBdgXwiDe+xjMkB0aRR4TAKoJ2AJfCJL7HP48KoMEDIKoEbADBnxKp9Xlv7V8JRlzMlTXuEExoa/EMJi3V5ZSrbvsLDYAAu25EcovvZqT8fIqkY7iw2Q6p5tStpqgFR3nvxfKKnudJWfDpD0BuinQO8E+zBofSJkfSps/WLI+uWw9QWRviTWF0Xtmwah0Y0RAXhGt8YE5P9Do5ujEpIfo9vjBrm5Pc5yQMIgtc8Vbx9Q+dpHZMgPSRmq/DQ+TO0+kAFaH6IOHi3lFXFUlhFth6a7WDXSdli6iyNB+3H5LvkEsgsTxeiQCA115FdminmCpGSJ9dJUOW02uXYwdm2uvIBqfHFSw5JWxMXJsiGsvDpb1ay8PH2pib4+/wcnUdJ/bu6siQAAAABJRU5ErkJggg==';
            }
            
            ctrl.src = src;
                
            ctrl.min = attrs.min || 0;
            ctrl.max = attrs.max || 100;
			
			console.log('attrs.step', attrs.step);

			ctrl.defvalue = null;
			ctrl.offset = 0;
			ctrl.minval = 0;
			ctrl.diameter = 64;
			ctrl.step = parseFloat(attrs.step || 1);
			ctrl.digits = parseInt(attrs.digits || 0, 10);
			ctrl.sprites = parseInt(attrs.sprites || 0, 10);
			ctrl.startPosX = null;
			ctrl.startPosY = null;
			ctrl.startVal = 0;
			ctrl.enable = !attrs.defaultValue;
			ctrl.defvalue = attrs.defaultValue || attrs.value;
			ctrl.width = attrs.width || attrs.diameter;
			ctrl.height = attrs.height || attrs.diameter;
			ctrl.ctlStep = 1;
			ctrl.sensitivity = parseInt(attrs.sensitivity || 1, 10);

			if(ctrl.step && ctrl.step < 1) {
                for(var n = ctrl.step ; n < 1; n *= 10)
                    ++ctrl.digits;
			}
			
			ctrl.minval = ctrl.min;
			ctrl.maxval = ctrl.max;
			if (ctrl.log) {
				if (ctrl.minval === 0)
					ctrl.minval = 0.001;
				ctrl.min = log2(ctrl.minval);
				ctrl.max = log2(ctrl);
				ctrl.setValue(log2(ctrl.value));
				ctrl.ctlStep = log2(ctrl.step);
				if (ctrl.ctlStep === 0)
					ctrl.ctlStep = 0.0001;
			} else {
				ctrl.ctlStep = ctrl.step;
				ctrl.setValue(ctrl.value);
			}				

			
			if(typeof(ctrl.onChange) === 'function') {
		        ctrl.onChange();
			}
					
            ctrl.knobStyle = {
                'background-image': 'url('+src+ ')',
				'width': (attrs.width || 64) +'px',
				'height': (attrs.height || 64) +'px',
				'backgroundSize': '100% ' + ((ctrl.sprites+1)*100)+'%'
            };
            
			redraw();            
        }
    };
}

// love our dependency injection and we are now safe from obfuscation
WebaudioKnob.$inject = ['$timeout', '$window'];
module.exports = WebaudioKnob;