/**
 * Copyright (C) 2013-2014 Christophe Rosset <tophe@topheman.com> - https://github.com/topheman/PanoramaSensorsViewer
 * 
 * Released under MIT License :
 * https://github.com/topheman/PanoramaSensorsViewer/blob/master/LICENSE
 */

define(['topheman-panorama/utils/sensorsChecker','topheman-panorama/utils/deviceorientationHelper','topheman-panorama/vendor/rAF'],function(sensorsChecker,deviceorientationHelper,undefined){
   
    var PanoramaManager,
        helper,
        panorama,   //panorama google object
        sv,         //streetView google object
        panoramaInitiated = false,
        currentPov = {heading:0,pitch:0},
        currentPovChanged = false,
        headingPrecision = 0.1,
        pitchPrecision = 0.1,
        animate,
        helper;
        
    //animation loop - runs 60fps, update the panorama point of view only if it has changed
    animate = function(){
        window.requestAnimationFrame(animate);
        //only render if the sensors have sense any change
        if(currentPovChanged === true){
            panorama.setPov({heading:currentPov.heading*headingPrecision,pitch:currentPov.pitch*pitchPrecision});
            currentPovChanged = false;
        }
    },
        
    helper = {
        addSensorListeners : function(){
            var self = this;
            deviceorientationHelper.init(function(e,infos){
                //in portrait we have only 90deg
                var pitch = (infos.orientation === 0 || infos.orientation === 180) ? (2*infos.tiltFB-90) : (infos.tiltFB-90);
                self.updatePov({heading:-infos.direction,pitch:pitch});
            });
        },
        updatePov: function(newPov){
            newPov.heading = Math.floor(newPov.heading/headingPrecision);
            newPov.pitch = Math.floor(newPov.pitch/pitchPrecision);
            if(panoramaInitiated === true && (newPov.heading !== currentPov.heading || newPov.pitch !== currentPov.pitch)){
                currentPov.heading = newPov.heading;
                currentPov.pitch = newPov.pitch;
                currentPovChanged = true;
            }
        }
    };
    
    PanoramaManager = function(panoramaHtmlObject){
        
        var panoramaDiv = panoramaHtmlObject,
            touchmoveCurrently = false;
        
        panoramaInitiated = false;
        
        var prepareDisableTouchmove = function(options){
            var touchmoveCallback,
                touchendCallback,
                disableTouchmoveCallback;
            if(("ontouchmove" in window) && options && options.disableTouchmove){
                if(typeof options.disableTouchmove === "function"){
                    disableTouchmoveCallback = options.disableTouchmove;
                    touchmoveCallback = function(e){
                        touchmoveCurrently = true;
                        e.stopPropagation();
                        e.preventDefault();
                        disableTouchmoveCallback.call({},e);
                    };
                    touchendCallback = function(e){
                        if(touchmoveCurrently === true){
                            e.stopPropagation();
                            e.preventDefault();
                            disableTouchmoveCallback.call({},e);
                        }
                        touchmoveCurrently = false;
                    };
                }
                else {
                    touchmoveCallback = function(e){
                        touchmoveCurrently = true;
                        e.preventDefault();
                    };
                    touchendCallback = function(e){
                        if(touchmoveCurrently === true){
                            e.preventDefault();
                        }
                        touchmoveCurrently = false;
                    };                    
                }
                panoramaDiv.addEventListener('touchmove',touchmoveCallback,true);
                panoramaDiv.addEventListener('touchend',touchendCallback,true);
            }
        };
            
        var prepare = function(latLon,options){
            
            var request, loadAllFunction;
            
            loadAllFunction = function() {
                sv = new google.maps.StreetViewService();
                panorama = new google.maps.StreetViewPanorama(panoramaDiv);
                prepareDisableTouchmove(options);
                panorama.setVisible(false);
                init(latLon,options,true);
                //add the sensors listeners once and for all
                sensorsChecker.checkDeviceorientation(function(){
                    //hack for android firefox mobile that hasn't always deviceorientation events ready
                    if(/Android.*(Mobile|Tablet).*Firefox/i.test(navigator.userAgent)){
                        sensorsChecker.checkDeviceorientation(function(){
                            helper.addSensorListeners();
                            animate();
                            panoramaInitiated = true;
                        },function(){
                            if(typeof options !== "undefined" && typeof options.firefoxSensorsNotReady === "function"){
                                options.firefoxSensorsNotReady();
                                helper.addSensorListeners();
                                animate();
                                panoramaInitiated = true;
                            }
                        });
                    }
                    else{
                        helper.addSensorListeners();
                        animate();
                        panoramaInitiated = true;
                    }
                },function(){
                    if(options && options.enableRemotetilt === true){
                        require(['topheman-panorama/vendor/device-motion-polyfill','topheman-panorama/utils/blockedPopup'],function(undefined,blockedPopup){
                            blockedPopup.isBlocked(remoteTiltWindow,function(){
                                if(options && options.remotetiltIsBlocked && typeof options.remotetiltIsBlocked === "function"){
                                    options.remotetiltIsBlocked();
                                }
                            });
                            blockedPopup.onUnblock(remoteTiltWindow,function(){
                                if(options && options.remotetiltIsUnblocked && typeof options.remotetiltIsUnblocked === "function"){
                                    options.remotetiltIsUnblocked();
                                }
                            });
                            helper.addSensorListeners();
                            animate();
                            panoramaInitiated = true;
                        });
                    }
                    else{
                        //if no remotetilt -> no events added, though, we have to init the panorama (to be able to request info such as current position)
                        panoramaInitiated = true;
                    }
                },{
                    userAgentCheck: /(iPad|iPhone|Nexus|Mobile|Tablet)/i
                });
            };
            
            //if the api is present, dont reload it, only launch
            if(typeof google !== "undefined" && google.maps && google.maps.version && google.maps.version[0] == "3"){
                console.log('goole maps API already loaded');
                loadAllFunction();
            }
            else{
                request = "async!http://maps.google.com/maps/api/js?sensor=false";
                if(options && options.googleApiKey){
                    request += "&key="+options.googleApiKey;
                }
                require([request],loadAllFunction);
            }
        };
        
        var init = function(latLon,options,firstInit){
            var position, processSVData, customPanoramaMode = false;
            if(typeof latLon === "undefined" || latLon === null){
                if(!(typeof options !== "undefined" && options.panoProvider && typeof options.panoProvider === "function") && options.pano){
                    throw new Error("No latLon specified. If you want to create a custom panorama, you must provide in the init options the attributes : 'pano' and 'panoProvider'.");
                }
                customPanoramaMode = true;
            }
            else {
                if(!(latLon.lat && latLon.lon)){
                    throw new Error("Missing 'lat' or 'lon' attributes in first param");
                }
                if(typeof options !== "undefined" && (options.panoProvider || options.pano) ){
                    throw new Error("Can't use either pano or panoProvider with a latLon specified, please use registerPanoProvider inside success callback (maybe for a next version)")
                }
                customPanoramaMode = false;
            }
            if(customPanoramaMode === false){
                position = new google.maps.LatLng(latLon.lat, latLon.lon); 
                processSVData = function(data, status){
                    if(status === google.maps.StreetViewStatus.OK){
                        //1rst set panorama location
                        panorama.setPano(data.location.pano);
                        //can be overloaded by options.success
                        if(options && options.success && typeof options.success === "function"){
                            options.success.call(panorama,data);
                        }
                        if(panorama.getVisible() === false){
                            //sorry for the setTimeout but without it at first load, some of your options.success may still be their ...
                            setTimeout(function(){
                                panorama.setVisible(true);
                            },0);
                        }
                    }
                    //if no panorama found, call the error callback if sepcified
                    else{
                        if(options && options.error && typeof options.error === "function"){
                            options.error.call({},"No panorama found");
                        }
                        else{
                            console.log("No panorama found");
                        }
                    }
                };

                sv.getPanoramaByLocation(position, 50, processSVData);
            }
            else{
                //this is a temporary panoProvider where callbacks are added to map the api
                //this panoprovider is only called once and then replaced with the original
                var tmpPanoProvider = function(pano){
                    var data = options.panoProvider(pano);
                    //can be overloaded by options.success
                    if(options && options.success && typeof options.success === "function"){
                        options.success.call(panorama,data);
                    }
                    if(panorama.getVisible() === false){
                        //sorry for the setTimeout but without it at first load, some of your options.success may still be their ...
                        setTimeout(function(){
                            panorama.setVisible(true);
                        },0);
                    }
                    //end to refactor
                    panorama.registerPanoProvider(options.panoProvider);
                    return data;
                };
                panorama.registerPanoProvider(tmpPanoProvider);
                panorama.setPano(options.pano);
            }
        };
        
        /**
         * 
         * @param {Object} latLon {lat:48.8534100,lon:2.3488000}
         * @params {Object} options @optional
         *  @config {Function} success Method called after configure (if a panorama was found) : function(data){ ... }
         *                     @scope {google.maps.StreetViewPanorama} panorama
         *                     @param {google.maps.StreetViewService} data returned by google APIs about the panorama found
         *  @config [Function} error Method called after init if no panorama was found : function(error){ ... }
         *  @config {Boolean} enableRemotetilt If no accelerometer found on the device, you can launch an emulator
         *  @config {Function} remotetiltIsBlocked Method called when the emulator popup was blocked by the browser
         *  @config {Function} remotetiltIsUnblocked Method called when the emulator popup was released by the browser
         */
        this.init = function(latLon,options){
            if(this.isInit()){
                init(latLon,options);
            }
            else{
                prepare(latLon,options);
            }
        };
        
        this.isInit = function(){
            return panoramaInitiated;
        };
        
        this.getCurrentPosition = function(){
            if(panoramaInitiated === false){
                throw new Error("Panorama needs to be init");
            }
            var position = panorama.getPosition();
            return {
                lat : position.d,
                lon : position.e
            };
        };
        
        this.getCurrentPov = function(){
            if(panoramaInitiated === false){
                throw new Error("Panorama needs to be init");
            }
            return panorama.getPov();
        };
        
        this.resize = function(){
            if(panoramaInitiated === false){
                throw new Error("Panorama needs to be init");
            }
            google.maps.event.trigger(panorama, 'resize');
        };
        
        this.getPanoramaHtmlObject = function(){
            return panoramaDiv;
        };
        
    };
    
    return PanoramaManager;
    
});