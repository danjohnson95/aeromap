var leaflet = require('leaflet');
require('Leaflet.Geodesic');
require('leaflet-rotatedmarker');
var functions = require('./functions.js');

var geoJsonLoaded = false;
var citiesLoaded = false;
var initialFind = false;
var watchID = null;
var icon = null;

var stats = document.getElementById('stats');
var locationNotFound = stats.querySelector('#location-not-found');
var locationFail = stats.querySelector('#location-fail');
var retryBtn = stats.querySelector('.retry-position');

var altitude = stats.querySelector('.altitude .value');
var heading = stats.querySelector('.heading .value');
var speed = stats.querySelector('.speed .value');
var city = stats.querySelector('.city .value');
var lastCompassHeading = 361;


var map = L.map('map', {
	center: [51.505, -0.09],
	zoom: 4
});
var style = {
	stroke: false,
	fill: true,
	fillColor: '#000',
	fillOpacity: 0.15
};

var planeIcon = L.icon({
    iconUrl:'marker.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

var geodesic = L.geodesic([], {
	weight: 2,
	opacity: 1,
	color: 'white',
	steps: 50
}).addTo(map);

functions.loadJSON('/dist/json/geojson_small.json', function(e){
	L.geoJson(e, {
        style: style
    }).addTo(map);
    document.dispatchEvent(new CustomEvent("mapLoaded"));
});

var cities = [];
functions.loadJSON('/dist/json/capitol.json', function(e){
	citiesLoaded = true;
	cities = e;
	document.dispatchEvent(new CustomEvent("citiesLoaded"));
});

var airports = [];
functions.loadJSON('/dist/json/airports.json', function(e){
	airports = e;
	document.dispatchEvent(new CustomEvent("searchLoaded"));
});

geodesic.setLatLngs([
	[
		new L.LatLng(51.505, -0.09),
		new L.LatLng(33.82, -118.38)
	]
]);

document.addEventListener('mapLoaded', function(e){

});

document.addEventListener("searchLoaded", function(e){
	
});

document.addEventListener("citiesLoaded", function(e){

});

retryBtn.addEventListener('click', function(e){
	tryLocation(false);
});

window.addEventListener('deviceorientation', function(e) {
	if(Number.isFinite(e.webkitCompassHeading) && Math.floor(e.webkitCompassHeading) != lastCompassHeading){
		showValue(heading, e.webkitCompassHeading, true);
		if(icon) icon.setRotationAngle(e.webkitCompassHeading);
	}else{
		valueFailed(heading);
	}
}, false);

tryLocation(true);

function tryLocation(first){
	if(navigator.geolocation){
		
		if(!first){
			navigator.geolocation.clearWatch(watchID);
			var elements = [altitude, heading, speed, city];
			for(i=0;i<elements.length;i++){
				resetValue(elements[i]);
			}
			if(locationNotFound.classList.contains('show')) locationNotFound.classList.remove('show');
			if(locationFail.classList.contains('show')) locationNotFound.classList.remove('show');

		}

		watchID = navigator.geolocation.watchPosition(function(e){
			showPosition(e);
		}, function(e){
			if(!locationNotFound.classList.contains('show')) locationNotFound.classList.add('show');
		});
		
	}else{
		if(!locationFail.classList.contains('show')) locationFail.classList.add('show');
	}
}


function showPosition(position){

	if(initialFind) map.panTo(L.latLng([position.coords.latitude, position.coords.longitude]));
	initialFind = true;

	icon = L.marker([
				position.coords.latitude, 
				position.coords.longitude
			], {
				icon: planeIcon, 
				rotationOrigin: 'center center'
	}).addTo(map);

	if(position.coords.altitude === null){
		valueFailed(altitude); 
	}else{ 
		showValue(altitude, position.coords.altitude, true);
	}

	if(position.coords.speed === null){
		valueFailed(speed); 
	}else{ 
		showValue(speed, position.coords.speed, true);
	}

	//if(position.coords.latitude === null) valueFailed(city); else showValue(city, NearestCity(position.coords.latitude, position.coords.longitude), false);
}

function valueFailed(element){
	if(element.classList.contains('loading')) element.classList.remove('loading');
	if(!element.classList.contains('failed')) element.classList.add('failed');
	element.innerHTML = "";
}

function resetValue(element){
	if(!element.classList.contains('loading')) element.classList.add('loading');
	if(element.classList.contains('failed')) element.classList.remove('failed');
	element.innerHTML = "";
}

function showValue(element, value, flatten){
	if(element.classList.contains('loading')) element.classList.remove('loading');
	if(element.classList.contains('failed')) element.classList.remove('failed');
	element.innerHTML = (flatten ? Math.floor(value) : value);
}

function NearestCity(latitude, longitude) {
	var mindif = 99999;
 	var closest;

  	for (index = 0; index < cities.length; ++index) {
    	var dif = functions.PythagorasEquirectangular(latitude, longitude, cities[index][1], cities[index][2]);
    	if (dif < mindif) {
      		closest = index;
     	 	mindif = dif;
    	}
  	}

  return cities[closest][0]+", "+cities[closest][3];
}


