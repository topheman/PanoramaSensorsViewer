/**
 * 
 * Copyright (C) 2013-2014 Christophe Rosset <tophe@topheman.com> - https://github.com/topheman
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 */

/**
 * Mostly all recent browsers expose an api for deviceorientation and devicemotion events.
 * That doesn't mean the device you're on has sensors (accelerometer+gyroscope) to feed them.
 * So to check if the device has sensors, you can't rely on simple feature detection like
 * "ondeviceorientation" in window or "ondevicemotion" in window
 * 
 * This module will let you check if there is really an accelerometer+gyroscope to rely on.
 */

(function (sensorsChecker){
    
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(sensorsChecker);
    } else {
        // Browser globals
        window.sensorsChecker = sensorsChecker();
    }
    
})(function(){
    
    var sensorsChecker,
        eventsMap = {
            "devicemotion" : {
                "event" : "DeviceMotionEvent",
                "handler" : function(e){
                    if(e.acceleration && e.acceleration.x !== null && e.acceleration.y !== null && eventsMap.devicemotion.support === false){
                        eventsMap.devicemotion.support = true;
                    }
                },
                support : false
            },
            "deviceorientation" : {
                "event" : "DeviceOrientationEvent",
                "handler" : function(e){
                    if(e.beta !== null && e.gamma !== null && eventsMap.deviceorientation.support === false){
                        eventsMap.deviceorientation.support = true;
                    }
                },
                support : false
            }
        },
        DEFAULT_DELAY = 500;
    
    sensorsChecker = {
        
        /**
         * 
         * @param {String} event "devicemotion"|"deviceorientation"
         * @param {Function} success
         * @param {Function} failure
         * @params {options} options @optional
         * @config {Number} delay
         * @config {RegExp} userAgentCheck
         */
        check: function(event, success, failure, options){
            
            options = options ? options : {};
            options.delay = options.delay ? options.delay : DEFAULT_DELAY;
            
            if(!eventsMap[event]){
                throw new Error("Only devicemotion or deviceorientation events supported");
            }
            if(typeof success !== "function"){
                throw new Error("success callback missing");
            }
            if(typeof failure !== "function"){
                throw new Error("success callback missing");
            }
            
            if(window[eventsMap[event].event]){
                if(options && options.userAgentCheck && options.userAgentCheck instanceof RegExp && options.userAgentCheck.test(window.navigator.userAgent)){
                    success();
                }
                else{
                    window.addEventListener(event, eventsMap[event].handler, false);
                    setTimeout(function(){
                        window.removeEventListener(event, eventsMap[event].handler);
                        if(eventsMap[event].support === true){
                            success();
                        }
                        else{
                            failure();
                        }
                    },options.delay);
                }
            }
            else{
                failure();
            }
            
        },
        
        checkDevicemotion: function(success, failure, options){
            this.check('devicemotion',success, failure, options);
        },
        
        checkDeviceorientation: function(success, failure, options){
            this.check('deviceorientation',success, failure, options);
        }
        
    };
    
    return sensorsChecker;
    
});