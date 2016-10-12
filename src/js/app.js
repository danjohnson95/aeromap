var leaflet = require('leaflet');
require('Leaflet.Geodesic');
require('leaflet-rotatedmarker');
var functions = require('./functions.js');

var geoJsonLoaded = false;
var citiesLoaded = false;

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
        iconUrl:'/dist/img/marker.png',
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
        geoJsonLoaded = true;
    });
    
	var cities = [];
    functions.loadJSON('/dist/json/capitol.json', function(e){
    	citiesLoaded = true;
    	cities = e;
    	document.dispatchEvent(new CustomEvent("ajaxLoaded"));
    	//$(document).trigger('ajaxLoaded');
    });

    var airports = [];
    functions.loadJSON('/dist/json/airports.json', function(e){
    	airports = e;
    	//$(document).trigger('searchLoaded');
    	document.dispatchEvent(new CustomEvent("searchLoaded"));
    });

    geodesic.setLatLngs([
    	[
    		new L.LatLng(51.505, -0.09),
    		new L.LatLng(33.82, -118.38)
    	]
	]);

    document.addEventListener("searchLoaded", function(e){
		console.log('search ready!');
	});

    var stats = document.getElementById('stats');
    var locationNotFound = stats.querySelector('#location-not-found');
    var locationFail = stats.querySelector('#location-fail');
    var retryBtn = stats.querySelector('.retry-position');

    retryBtn.addEventListener('click', function(e){
    	console.log('CLICKED');
    });

	if(navigator.geolocation){

		navigator.geolocation.watchPosition(function(e){
			console.log('position ready');
			document.addEventListener('ajaxLoaded', function(){
				console.log('ajax Loaded');
				console.log(geoJsonLoaded);
				console.log(citiesLoaded);
				if(geoJsonLoaded && citiesLoaded){
					console.log('ready to show');
					showPosition(e);
				}
			});
		}, function(e){
			locationNotFound.classList.add('show');
		});
		
	}else{
		locationFail.classList.add('show');
	}

	
	var altitude = stats.querySelector('.altitude .value');
	var heading = stats.querySelector('.heading .value');
	var speed = stats.querySelector('.speed .value');
	var city = stats.querySelector('.city .value');
	var lastCompassHeading = 361;

	var icon = null;

	window.addEventListener('deviceorientation', function(e) {

		if(Number.isFinite(e.webkitCompassHeading) && Math.floor(e.webkitCompassHeading) != lastCompassHeading){
			if(heading.classList.contains('loading')) heading.classList.remove('loading');
			if(heading.classList.contains('failed')) heading.classList.remove('failed');
			heading.innerHTML = Math.floor(e.webkitCompassHeading);
			if(icon) icon.setRotationAngle(e.webkitCompassHeading);
		}else{
    		heading.classList.remove('loading');
    		heading.classList.add('failed');
    	}
	}, false);

	function showPosition(position){
		console.log('Got position!');
		console.log(position);

		icon = L.marker([position.coords.latitude, position.coords.longitude], {
			icon: planeIcon, 
			rotationOrigin: 'center center'
		}).addTo(map);
		
		map.panTo(L.latLng([position.coords.latitude, position.coords.longitude]));

		if(position.coords.altitude === null) valueFailed(altitude); else showValue(altitude, position.coords.altitude, true);
		if(position.coords.speed === null) valueFailed(speed); else showValue(speed, position.coords.speed, true);
		if(position.coords.latitude === null) valueFailed(city); else showValue(city, NearestCity(position.coords.latitude, position.coords.longitude), false);
	}

	function valueFailed(element){
		if(element.classList.contains('loading')) element.classList.remove('loading');
		if(!element.classList.contains('failed')) element.classList.add('failed');
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

	  return [cities[closest][0], cities[closest][3]];
	}


