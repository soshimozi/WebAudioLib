const WebaudioKeyboard = function($window, $document) {
    return {
        restrict: 'E',
        scope: {
            value:'=',
            width: '@',
            height: '@',
            outline: '@',
            numKeys: '@',
            colors: '@',
            min: '@',
            onNote: '&'
        },        
        replace: true,
        template: "<div class='webaudio-keyboard' ng-style=\"{'width': width + 'px', 'height': height + 'px'}\"><canvas height='{{height}}' width='{{width}}' class='webaudio-keyboard-body' ng-style=\"{'width': width + 'px', 'height': height + 'px'}\" tabindex='1' touch-action='none'></canvas><div class='webaudioctrl-tooltip'></div></div>",
        link: {
            post: function(scope, elem, attrs, ngModelCtrl) { 

                scope.cv = elem[0].querySelector('.webaudio-keyboard-body');
                scope.ctx = scope.cv.getContext("2d");
                
                scope.height = scope.height || 128;
                scope.width = scope.width || 480;
                scope.keys = scope.keys || 25;
                scope.min = scope.min || 0;
                scope.colors = scope.colors || "#222;#eee;#ccc;#333;#000;#e88;#c44;#c33;#800";

                scope.outline = parseBoolean(scope.outline || "true");
                scope.press = 0;

                scope.keycodes1=[90,83,88,68,67,86,71,66,72,78,74,77,188,76,190,187,191,226];
                scope.keycodes2=[81,50,87,51,69,82,53,84,54,89,55,85,73,57,79,48,80,192,222,219];    
                
                scope.digits = 0;

                $window.addEventListener('keyup', keyup, true);

                $window.addEventListener("mousemove",pointermove);
                $window.addEventListener("mousedown",pointerdown);
                $window.addEventListener("touchmove",pointermove,{passive:false});
                $window.addEventListener("mouseup",pointerup);

                let canvasPosition = {
                    x: scope.cv.offsetLeft,
                    y: scope.cv.offsetTop
                };            

                function parseBoolean(string) {
                    switch(string.toLowerCase().trim()){
                        case "true": case "yes": case "1": return true;
                        case "false": case "no": case "0": case null: return false;
                        default: return Boolean(string);
                    }
                }

                function keyup(e) {
                    let m = Math.floor((scope.min+11)/12)*12;
                    let k = scope.keycodes1.indexOf(e.keyCode);
                    if(k<0) {
                        k=scope.keycodes2.indexOf(e.keyCode);
                        if(k>=0) k+=12;
                    }

                    if(k>=0) {
                        k+=m;
                    }
                }

                function pointerdown(e){
                    scope.cv.focus();
                    ++scope.press;
                    pointermove(e);
                    e.preventDefault();
                }

                function pointermove(e) {
                    let r=elem[0].getBoundingClientRect();

                    let v=[],p;
                    if(scope.press) {
                        p=[e];
                    }
                    else {
                        p=[];
                    }

                    if(p.length>0) {
                        scope.drag=1;
                    }

                    for(let i=0;i<p.length;++i) {
                        let px=p[i].clientX-r.left;
                        let py=p[i].clientY-r.top;

                        let x,k,ko;
                        if(py<scope.bheight && py>0) {
                            x=px-scope.wwidth*scope.ko[scope.min%12];
                            k=scope.min+((x/scope.bwidth)|0);
                        }
                        else if(py > 0 && py<scope.height) {
                            k=(px/scope.wwidth)|0;
                            ko=scope.kp[scope.min%12];
                            k+=ko;
                            k=scope.min+((k/7)|0)*12+scope.kn[k%7]-scope.kn[ko%7];
                        }
                        if(k>=scope.min&&k<=scope.max) {
                            v.push(k);
                        }
                    }
                    
                    v.sort();
                    scope.values=v;

                    sendevent();
                    redraw()                
                }

                function pointerup(e){
                    //if(scope.enable) {
                    --scope.press;
                    pointermove(e);
                    sendevent();
                    redraw();
                    //}
                    scope.drag=0;
                    e.preventDefault();
                }            

                function sendevent() {
                    let notes=[];
                    for(let i=0,j=scope.valuesold.length;i<j;++i) {
                    if(scope.values.indexOf(scope.valuesold[i])<0)
                        notes.push([0,scope.valuesold[i]]);
                    }
                    for(let i=0,j=scope.values.length;i<j;++i) {
                    if(scope.valuesold.indexOf(scope.values[i])<0)
                        notes.push([1,scope.values[i]]);
                    }

                    if(notes.length) {
                    scope.valuesold=scope.values;
                    for(let i=0;i<notes.length;++i) {
                        setdispvalues(notes[i][0],notes[i][1]);

                        if(scope.onNote && typeof scope.onNote === 'function') {
                            scope.onNote({note: notes[i]}); 
                        }
                    }
                    }
                }

                function setdispvalues(state,note) {
                    let n=scope.dispvalues.indexOf(note);
                    if(state) {
                    if(n<0) scope.dispvalues.push(note);
                    }
                    else {
                    if(n>=0) scope.dispvalues.splice(n,1);
                    }
                }           

                function redraw() {
                    function rrect(ctx, x, y, w, h, r, c1, c2) {

                        if(c2) {
                            let g=ctx.createLinearGradient(x,y,x+w,y);
                            g.addColorStop(0,c1);
                            g.addColorStop(1,c2);
                            ctx.fillStyle=g;
                        }
                        else {
                            ctx.fillStyle=c1;
                        }

                        ctx.beginPath();
                        ctx.moveTo(x, y);
                        ctx.lineTo(x+w, y);
                        ctx.lineTo(x+w, y+h-r);
                        ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
                        ctx.lineTo(x+r, y+h);
                        ctx.quadraticCurveTo(x, y+h, x, y+h-r);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                        ctx.fill();
                    }


                    scope.ctx.fillStyle = scope.coltab[0];
                    scope.ctx.fillRect(0,0,scope.width,scope.height);

                    let x0=7*((scope.min/12)|0)+scope.kp[scope.min%12];
                    let x1=7*((scope.max/12)|0)+scope.kp[scope.max%12];
                    let n=x1-x0;

                    scope.wwidth=(scope.width-1)/(n+1);
                    scope.bwidth=scope.wwidth*7/12;

                    let h2=scope.bheight;
                    let r=Math.min(8,scope.wwidth*0.2);
                    for(let i=scope.min,j=0;i<=scope.max;++i) {
                        if(scope.kf[i%12]==0) {
                            let x=scope.wwidth*(j++)+1;
                            if(scope.dispvalues.indexOf(i)>=0)
                            rrect(scope.ctx,x,1,scope.wwidth-1,scope.height-2,r,scope.coltab[5],scope.coltab[6]);
                            else
                            rrect(scope.ctx,x,1,scope.wwidth-1,scope.height-2,r,scope.coltab[1],scope.coltab[2]);
                        }
                    }

                    r=Math.min(8,scope.bwidth*0.3);
                    for(let i=scope.min;i<scope.max;++i) {
                        if(scope.kf[i%12]) {
                            let x=scope.wwidth*scope.ko[scope.min%12]+scope.bwidth*(i-scope.min)+1;
                            if(scope.dispvalues.indexOf(i)>=0)
                            rrect(scope.ctx,x,1,scope.bwidth,h2,r,scope.coltab[7],scope.coltab[8]);
                            else
                            rrect(scope.ctx,x,1,scope.bwidth,h2,r,scope.coltab[3],scope.coltab[4]);
                            scope.ctx.strokeStyle=scope.coltab[0];
                            scope.ctx.stroke();
                        }
                    }
                }

                scope.kp=[0,7/12,1,3*7/12,2,3,6*7/12,4,8*7/12,5,10*7/12,6];
                scope.kf=[0,1,0,1,0,0,1,0,1,0,1,0];
                scope.ko=[0,0,(7*2)/12-1,0,(7*4)/12-2,(7*5)/12-3,0,(7*7)/12-4,0,(7*9)/12-5,0,(7*11)/12-6];
                scope.kn=[0,2,4,5,7,9,11];
                scope.coltab=scope.colors.split(";");    
                
                scope.bheight = scope.height * 0.55;
                scope.max=scope.min+scope.keys-1;
                scope.dispvalues=[];
                scope.valuesold=[];
                if(scope.kf[scope.min%12])
                --scope.min;
                if(scope.kf[scope.max%12])
                ++scope.max;       


                let shouldLoop = true;
                function loop () {
                if (shouldLoop) {
                    // Call "loop" on the next frame
                    requestAnimationFrame(loop);
                }
                
                redraw();
                }

                loop();
            }
        }
    }
}

WebaudioKeyboard.$inject = ['$window', '$document'];
module.exports = WebaudioKeyboard;