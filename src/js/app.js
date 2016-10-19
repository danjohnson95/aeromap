var leaflet = require('leaflet');
require('Leaflet.Geodesic');
require('leaflet-rotatedmarker');
var functions = require('./functions.js');

var geoJsonLoaded = false;
var citiesLoaded = false;
var icon = null;

var lastCompassHeading = 361;


window.aeromap = {

	initialFind: true,
	map: null,
	first: true,
	watchID: null,
	cities: null,
	planeIcon: null,
	mapLoaded: false,

	heading: null,
	latitude: null,
	longitude: null,
	altitude: null,
	speed: null,
	city: null,

	elements: {
		stats: null,
		body: null,
		retryBtn: null,
		altitude: null,
		heading: null,
		speed: null,
		city: null,
		mapLoading: null,
		locationBtn: null,
		settingsBtn: null
	},

	init: function(){
		this.map = L.map('map', {
			center: [51.505, -0.09],
			zoom: 4,
			scrollWheelZoom:'center'
		});

		this.planeIcon = L.icon({
		    iconUrl: '/dist/img/marker-icon.png',
		    iconRetinaUrl: '/dist/img/marker-icon-2.png',
		    iconAnchor: [15, 15],
		    iconSize: [30, 30]
		});

			L.marker([
				51, 
				0
			], {
				icon: this.planeIcon, 
				rotationOrigin: 'center center'
			}).addTo(this.map);

		this.getElements();
		this.tryLocation();
	},

	getElements: function(){
		this.elements.stats = document.getElementById('stats');
		this.elements.body = document.getElementsByTagName('body')[0];
		this.elements.mapLoading = document.getElementById('mapload');
		this.elements.buttons = this.elements.body.querySelector('.buttons');
		this.elements.retryBtn = stats.querySelector('.retry-position');
		this.elements.altitude = stats.querySelector('.altitude .value');
		this.elements.heading = stats.querySelector('.heading .value');
		this.elements.speed = stats.querySelector('.speed .value');
		this.elements.city = stats.querySelector('.city .value');
		this.elements.locationBtn = this.elements.buttons.querySelector('.move-map');
		this.elements.settingsBtn = this.elements.buttons.querySelector('.settings');
	},

	tryLocation: function(){
		if(navigator.geolocation){
			
			if(!this.first){
				navigator.geolocation.clearWatch(watchID);
				var elements = [
					this.elements.altitude, 
					this.elements.heading, 
					this.elements.speed, 
					this.elements.city
				];

				for(i=0;i<elements.length;i++){
					this.resetValue(elements[i]);
				}
				if(this.elements.body.classList.contains('location-err')) this.elements.body.classList.remove('location-err');
			}

			watchID = navigator.geolocation.watchPosition(function(e){
				aeromap.latitude = e.coords.latitude;
				aeromap.longitude = e.coords.longitude;
				aeromap.altitude = e.coords.altitude;
				aeromap.speed = e.coords.speed;

				aeromap.showPosition();
			}, function(e){
				if(!aeromap.elements.body.classList.contains('location-err')) aeromap.elements.body.classList.add('location-err');
				this.resetTimer = setTimeout(aeromap.tryLocation, 5000);
			});
		}else{
			// Location not supported
		}
	},

	showPosition: function(){
		if(this.initialFind) this.map.panTo(L.latLng([this.latitude, this.longitude]));
		if(this.elements.body.classList.contains('location-err')) this.elements.body.classList.remove('location-err');
		this.initialFind = false;

		this.getCity();

		if(this.mapLoaded){
			L.marker([
				this.latitude, 
				this.longitude
			], {
				icon: this.planeIcon, 
				rotationOrigin: 'center center'
			}).addTo(this.map);
		}

		if(this.altitude === null){
			this.valueFailed(this.elements.altitude); 
		}else{ 
			this.showValue(this.elements.altitude, this.altitude, true);
		}

		if(this.speed === null){
			this.valueFailed(this.elements.speed); 
		}else{ 
			this.showValue(this.elements.speed, this.speed, true);
		}
	},

	getCity: function(){
		if(this.latitude !== null && this.cities){
			this.city = this.nearestCity(this.latitude, this.longitude);
			this.showValue(this.elements.city, this.city, false);
		}
	},

	valueFailed: function(element){
		if(element.classList.contains('loading')) element.classList.remove('loading');
		if(!element.classList.contains('failed')) element.classList.add('failed');
		element.innerHTML = "";
	},

	resetValue: function(element){
		if(!element.classList.contains('loading')) element.classList.add('loading');
		if(element.classList.contains('failed')) element.classList.remove('failed');
		element.innerHTML = "";
	},

	showValue: function(element, value, flatten){
		if(element.classList.contains('loading')) element.classList.remove('loading');
		if(element.classList.contains('failed')) element.classList.remove('failed');
		element.innerHTML = (flatten ? Math.floor(value) : value);
	},

	nearestCity: function(latitude, longitude){
		var mindif = 99999;
	 	var closest;

	  	for (index = 0; index < this.cities.length; ++index) {
	    	var dif = functions.PythagorasEquirectangular(latitude, longitude, this.cities[index][1], this.cities[index][2]);
	    	if (dif < mindif) {
	      		closest = index;
	     	 	mindif = dif;
	    	}
	  	}

	  return this.cities[closest][0];
	}
};

first = true;
aeromap.init();

var style = {
	stroke: false,
	fill: true,
	fillColor: '#000',
	fillOpacity: 0.15
};


// var geodesic = L.geodesic([], {
// 	weight: 2,
// 	opacity: 1,
// 	color: 'white',
// 	steps: 50
// }).addTo(aeromap.map);

functions.loadJSON('/dist/json/geojson_small.json', function(e){
	L.geoJson(e, {
        style: style
    }).addTo(aeromap.map);
    document.dispatchEvent(new CustomEvent("mapLoaded"));
    aeromap.mapLoaded = true;
    if(aeromap.latitude){
		L.marker([aeromap.latitude, aeromap.longitude], {
			icon: aeromap.planeIcon, 
			rotationOrigin: 'center center'
		}).addTo(aeromap.map);
    }
});

functions.loadJSON('/dist/json/majorcities.json', function(e){
	citiesLoaded = true;
	aeromap.cities = e;
	document.dispatchEvent(new CustomEvent("citiesLoaded"));
});

var airports = [];
functions.loadJSON('/dist/json/airports.json', function(e){
	airports = e;
	document.dispatchEvent(new CustomEvent("searchLoaded"));
});

// geodesic.setLatLngs([
// 	[
// 		new L.LatLng(51.505, -0.09),
// 		new L.LatLng(33.82, -118.38)
// 	]
// ]);
// 
aeromap.elements.locationBtn.addEventListener('click', function(){
	aeromap.map.setView(new L.LatLng(aeromap.latitude, aeromap.longitude), 4, {animate: true});
});

document.addEventListener('mapLoaded', function(e){
	if(aeromap.elements.mapLoading.classList.contains('show')) aeromap.elements.mapLoading.classList.remove('show');
});

document.addEventListener("searchLoaded", function(e){
	
});

document.addEventListener("citiesLoaded", function(e){
	aeromap.getCity();
});

window.addEventListener('deviceorientation', function(e) {
	if(Number.isFinite(e.webkitCompassHeading) && Math.floor(e.webkitCompassHeading) != lastCompassHeading){
		aeromap.heading = Math.floor(e.webkitCompassHeading);
		aeromap.showValue(aeromap.elements.heading, e.webkitCompassHeading, true);
		if(icon) icon.setRotationAngle(e.webkitCompassHeading);
	}else{
		aeromap.valueFailed(aeromap.elements.heading);
	}
}, false);

setTimeout(function(){
	if(aeromap.heading === null) aeromap.valueFailed(aeromap.elements.heading);
})




