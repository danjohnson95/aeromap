# aeromap
An offline-accessible world map with your GPS location plotted on, so you can see where you are during a flight.

[Aeromap Screenshot](https://danjohnson.xyz/img/aeromap.jpg)

Use your device's GPS location service to find out where you are when you're on a flight.

## See it in action

Head over to https://aeromap.xyz on an iOS device. Tap the Share button at the bottom of Safari, and select *Add to Home Screen*. Open the application from the home screen - this is when the necessary files get cached.

And you're ready to go! Don't forget to activate Airplane Mode when you board the aircraft.

## How it works

The map, rendered using [Leaflet.js](http://leafletjs.com), is generated from a small (561KB) [geoJSON file](https://github.com/danjohnson95/aeromap/blob/master/geojson1.json) which is cached locally on your device. This allows you to view any region in any zoom, all whilst in Airplane Mode.

Your location is gathered using the [HTML5 Geolocation API](https://developer.apple.com/reference/webkitjs/geolocation). This also gathers your altitude and speed which are also shown on the application.

Your heading is gathered using the [DeviceOrientation API](https://developer.apple.com/reference/webkitjs/deviceorientationevent/1804777-webkitcompassheading).

The rotation of the icon is acheived using the plugin [Leaflet.RotatedMarker](https://github.com/bbecquet/Leaflet.RotatedMarker).

The flight path is drawn using the plugin [Leaflet.Geodesic](https://github.com/henrythasler/Leaflet.Geodesic)

## Contributions

Contributions to this repository are welcome!

Requirements:
- Node
- npm
- Gulp
    
Run `gulp build` to build assets from the `/src` directory to the `/dist` directory. Please see the `gulpfile.js` for more commands available. 
