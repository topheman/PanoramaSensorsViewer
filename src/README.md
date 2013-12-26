#PanoramaSensorsViewer - API doc

I made a bunch of examples, this may be the best way to understand how PanoramaSensorsViewer works. [You can test them online here](http://labs.topheman.com/PanoramaSensorsViewer/). I also invite you to checkout the Google Maps API doc.

Still, here is the API doc.

##Require PanoramaManager

The very first thing you need to do is require the module `topheman-panorama/PanoramaManager`. Here is an example of how to do that (you may have a different way since RequireJS has different ways to load).

```html

	<!-- put what's bellow just before your </body> closing tag -->
    <script src="./js/vendor/require.js" type="text/javascript"></script>
	<script type="text/javascript">
	    require(['./js/require.config'], function(config) {
	        require(['topheman-panorama/PanoramaManager'],function(PanoramaManager){
				//... there is your code
	        });
	    });
	</script>

```

##PanoramaManager

###Summary

Creates a JavaScript `PanoramaManager` instance linked to the `DOMObject` **passed in parameter**. At this moment, the instance does pretty much nothing until it is initialized by calling the method `init`.

###Constructor

```js

var panoramaManager = new PanoramaManager(document.getElementById('pano'));

```

###Methods

####.init(position,options)

You can call the `.init` method as many times as you want, however, you need to keep in mind some events and callback options will only happen at the first time you call it, such as :

* retrieving the Google Maps API
* connecting to the gyroscope+accelerometer (ie `addEventListener("deviceorientation", ...)` )

This will init your panorama, filling the DOMObject you passed previously.

#####parameters

* `position` : 2 possibilities (see bellow when to use either one of them)
	* `Object` with latitude and longitude. Example : `{lat:37.869260, lon:-122.254811}`
	* `null`
* `options` : this parameter is optional
	* `success` : `[Function]` `function(data){ /* scope is the panorama object on which you can call any Google Maps API */ }`
	* `error` : `[Function]` `function(error){ /* … */ }`
	* `pano` : `[String]` custom panorama id on which you wish to start your panorama (you'll need to provide a panoProvider callback)
	* `panoProvider` : `[Function]` custom panorama provider method for full custom panoramas (not linked with any Google Street View panoramas). You'll need to provide a panorama id as options.pano to specify which panorama you want to start with. [See example](https://github.com/topheman/PanoramaSensorsViewer/blob/master/src/js/PanoramaSensorsViewer/src/demo.custompanorama.html).
	* `enableRemotetilt` : `[Boolean]` Will load the deviceorientation emulator if set at true (and if no sensors on your device)
	* `remotetiltIsBlocked` : `[Function]` Callback called if the emulator popup has been blocked by a popup blocker such as adBlock
	* `remotetiltIsUnblocked` : `[Function]` Callback called if the emulator popup has not been blocked by a popup blocker
	* `disableTouchmove` : `[Boolean|Function]` Disables the touchmove. If a function is given, this will be executed on touchmove.
	* `firefoxSensorsNotReady` : `[Function]` On some android devices, firefox mobile takes some time to add the event listener on the deviceorientation, this callback lets you spot when it happens to tell your user to reload for example
	* `googleApiKey` : `[String]` if you have a google API key and you let PanoramaSensorsViewer load the Google Maps API, you can specify your key here. (note that the API won't be loaded again if you already loaded it yourself).

#####parameters advanced infos

* in the `success` callback, you have access to all the Google Maps API that you can apply to your Google panorama which is the current scope `this`.
* You can't use `pano` without `panoProvider` and only for panoramas which aren't connected to Google Street View (you'll be giving a `null` position in this case) ([see example](https://github.com/topheman/PanoramaSensorsViewer/blob/master/src/js/PanoramaSensorsViewer/src/demo.custompanorama.html)).
* If you want to connect your custom panorama, use the Google Maps API inside the `success` callback : `.registerPanoProvider()` like in [this example](https://github.com/topheman/PanoramaSensorsViewer/blob/master/src/js/PanoramaSensorsViewer/src/demo.custompanorama.tiles.html).

####.isInit()

returns `true` if the panorama is initialized

####.resize()

triggers the resize event on the panorama (you would like to do that if you resize the DOMObject containing the panorama)