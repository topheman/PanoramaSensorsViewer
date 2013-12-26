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

(function (deviceorientationHelper){
    
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(deviceorientationHelper);
    } else {
        // Browser globals
        window.deviceorientationHelper = deviceorientationHelper();
    }
    
})(function(){
    
    var deviceorientationHelper,
            _getDeviceorientationHandler,
            _eventToInfos,
            _mozScreenOrientationToWindowOrientation,
            deviceorientationHandler;
    
    _mozScreenOrientationToWindowOrientation = function(orientation){
        var result;//@todo cache orientation
        switch(orientation){
            case "portrait-primary" :
                result = 0;
                break;
            case "portrait-secondary" :
                result = 180;
                break;
            case "landscape-primary" :
                result = 90;
                break;
            case "landscape-secondary" :
                result = -90;
                break;
            default :
                result = 0;
                break;
        };
        return result;
    };
    
    _eventToInfos = function(e,infos){
        switch(infos.orientation){
            case 0 :
                infos.tiltLR = e.gamma;
                infos.tiltFB = e.beta;
                infos.direction = e.alpha;
                break;
            case 90 :
                infos.tiltLR = e.beta;
                infos.tiltFB = (-e.gamma >= 0 ? -e.gamma : (360 - e.gamma));
                infos.direction = (e.alpha-90)%360;
                break;
            case -90 :
                infos.tiltLR = -e.beta;
                infos.tiltFB = e.gamma;
                infos.direction = (e.alpha+90)%360;
                break;
            case 180 :
                infos.tiltLR = -e.gamma;
                infos.tiltFB = -e.beta;
                infos.direction = e.alpha;
                break;
        };
    };
    
    _eventToInfosFirefox = function(e,infos){
        switch(infos.orientation){
            case 0 :
                infos.tiltLR = -e.gamma;
                infos.tiltFB = -e.beta;
                infos.direction = -e.alpha;
                break;
            case 90 :
                infos.tiltLR = -e.beta;
                infos.tiltFB = e.gamma;
                infos.direction = -(e.alpha+90)%360;
                break;
            case -90 :
                infos.tiltLR = e.beta;
                infos.tiltFB = -e.gamma;
                infos.direction = -(e.alpha+90)%360;
                break;
            case 180 :
                infos.tiltLR = e.gamma;
                infos.tiltFB = e.beta;
                infos.direction = -e.alpha;
                break;
        };
    };
    
    _getDeviceorientationHandler = function(callback){
        //for android firefox mobile
        if(/Android.*(Mobile|Tablet).*Firefox/i.test(window.navigator.userAgent)){
            return function(e,infos){
                infos = {
                    "orientation" : _mozScreenOrientationToWindowOrientation(window.screen.mozOrientation),
                    "heading"     : null,
                    "absolute"    : e.absolute
                };
                _eventToInfosFirefox(e,infos);
                callback.call({},e,infos);
            };
        }
        //for others
        else{
            return function(e,infos){
                infos = {
                    "orientation" : window.orientation || 0,
                    "heading"     : e.compassHeading || e.webkitCompassHeading,
                    "absolute"    : e.absolute
                };
                _eventToInfos(e,infos);
                callback.call({},e,infos);
            };
        }
    };
    
    deviceorientationHelper = {
        
        /**
         * @description adds a callback like you would do on deviceorientation event
         * but gives you a second argument so that you won't have to bother with the orientation of the device
         * @param {Function} callback function(e,infos){ ... }
         *      @param {DeviceOrientationEvent} e
         *      @param {Object} infos processed deviceorientation infos (according to orientation of the device)
         */
        init: function(callback){
            
            if(typeof deviceorientationHandler !== "undefined"){
                throw new Error("deviceorientationHelper already initiated, please .destroy() it before reinitiate it");
            }
            
            //init deviceorientationHandler
            deviceorientationHandler = _getDeviceorientationHandler(callback);
            window.addEventListener('deviceorientation',deviceorientationHandler,false);
            
        },
                
        /**
         * @description destroys the handlers added at init
         */
        destroy: function(){
            
            if(typeof deviceorientationHandler === "undefined"){
                throw new Error("deviceorientationHelper already destroy (or nether initiated), please .init() it before destroying it");
            }
            
            window.removeEventListener('deviceorientation',deviceorientationHandler,false);
            
        }
        
    };
    
    return deviceorientationHelper;
    
});