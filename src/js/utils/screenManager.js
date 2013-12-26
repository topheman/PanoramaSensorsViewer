/**
 * Copyright (C) 2013-2014 Christophe Rosset <tophe@topheman.com> - https://github.com/topheman/PanoramaSensorsViewer
 * 
 * Released under MIT License :
 * https://github.com/topheman/PanoramaSensorsViewer/blob/master/LICENSE
 */

/**
 * Little util I made so that your panorama fits and resizes the window
 * You're free to use it.
 * Good point : when you resizes, it won't resize the panorama at each resize event.
 * 
 * Just include it and launch the two methods when your panorama is initialized - see examples in the repo if necessary.
 */

(function (screenManager){
    
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(screenManager);
    } else {
        // Browser globals
        window.screenManager = screenManager();
    }
    
})(function(){
    
    var screenManager,
        _privateHelper,
        panoramaDiv,
        panoramaManager;
    
    _privateHelper = {
        panoramaFitToWindow: function(){
            panoramaDiv.style.width = window.innerWidth;
            panoramaDiv.style.height = window.innerHeight;
        },
        initResizeEvent: function(){
            var self = this,
                timer = false;
            window.addEventListener('resize',function(e){
                if(!timer){
                    timer = setTimeout(function(){
                        console.log('done resizing');
                        clearTimeout(timer);
                        timer = false;
                        if(panoramaManager.isInit()){
                            self.panoramaFitToWindow();
                            panoramaManager.resize();
                        }
                    },800);
                }
            },false);
        }
    };
    
    screenManager = {
        init: function(panoramaManager){
            
            var panoramaDiv = panoramaManager.getPanoramaHtmlObject();
            
            var panoramaFitToWindow = function(){
                panoramaDiv.style.width = window.innerWidth+"px";
                panoramaDiv.style.height = window.innerHeight+"px";
            };
            var initResizeEvent = function(){
                var timer = false;
                window.addEventListener('resize',function(e){
                    if(!timer){
                        timer = setTimeout(function(){
                            console.log('done resizing');
                            clearTimeout(timer);
                            timer = false;
                            if(panoramaManager.isInit()){
                                panoramaFitToWindow();
                                panoramaManager.resize();
                            }
                        },800);
                    }
                },false);
            };
            
            panoramaFitToWindow();
            initResizeEvent();
        }
    };
    
    return screenManager;
    
});