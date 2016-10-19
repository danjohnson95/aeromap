var leaflet = require('leaflet');
require('Leaflet.Geodesic');
require('leaflet-rotatedmarker');
var functions = require('./functions.js');


var lastCompassHeading = 361;


window.aeromap = {

	initialFind: true,
	map: null,
	first: true,
	watchID: null,
	cities: null,
	planeIcon: null,
	icon: null,
	mapLoaded: false,
	path: null,


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
		settingsBtn: null,
		settingsOverlay: null,
		settingsModal: null
	},

	style: {
		stroke: false,
		fill: true,
		fillColor: '#000',
		fillOpacity: 0.15
	},

	pathStyle: {
		weight: 2,
		opacity: 1,
		color: 'white',
		steps: 50
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
		this.elements.settingsOverlay = document.getElementById('settings-overlay');
		this.elements.settingsModal = document.getElementById('settings-modal');
	},

	tryLocation: function(){
		if(navigator.geolocation){
			
			if(!this.first){
				navigator.geolocation.clearWatch(this.watchID);
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

			this.watchID = navigator.geolocation.watchPosition(function(e){
				aeromap.latitude = e.coords.latitude;
				aeromap.longitude = e.coords.longitude;
				aeromap.altitude = e.coords.altitude;
				aeromap.speed = e.coords.speed;

				aeromap.showPosition();

			}, function(e){
				if(!aeromap.elements.body.classList.contains('location-err')) aeromap.elements.body.classList.add('location-err');
				aeromap.resetTimer = setTimeout(aeromap.tryLocation, 5000);
			});
		}else{
			// Location not supported
		}
	},

	showPosition: function(){
		this.hasLocation = true;
		if(this.initialFind) this.moveMapToCurrentLocation();
		this.initialFind = false;
		this.removeLocationErr();

		this.getCity();

		if(!this.icon) this.applyMarker();

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

	removeLocationErr: function(){
		if(this.elements.body.classList.contains('location-err')) this.elements.body.classList.remove('location-err');
	},

	getCity: function(){
		if(this.latitude !== null && this.cities){
			this.city = this.nearestCity();
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

	nearestCity: function(){
		var mindif = 99999;
	 	var closest;

	  	for (index = 0; index < this.cities.length; ++index) {
	    	var dif = functions.PythagorasEquirectangular(this.latitude, this.longitude, this.cities[index][1], this.cities[index][2]);
	    	if (dif < mindif) {
	      		closest = index;
	     	 	mindif = dif;
	    	}
	  	}

	  return this.cities[closest][0];
	},

	applyGeoJSON: function(data){
		L.geoJson(data, {
        	style: this.style
    	}).addTo(this.map);

    	document.dispatchEvent(new CustomEvent("mapLoaded"));
    	this.mapLoaded = true;
	},

	applyMarker: function(){
		if(this.hasLocation){
			this.icon = L.marker([this.latitude, this.longitude], {
				icon: this.planeIcon,
				rotationOrigin: 'center center'
			}).addTo(this.map);

		}
	},

	createGeodesic: function(){
		this.path = L.geodesic([], this.pathStyle).addTo(this.map);
	},

	moveGeodesic: function(){
		this.path.setLatLngs([[
			new L.LatLng(this.route.origin.lat, this.route.origin.lng),
			new L.LatLng(this.route.dest.lat, this.route.dest.lng)	
		]]);
	},

	hideMapLoading: function(){
		if(this.elements.mapLoading.classList.contains('show')) this.elements.mapLoading.classList.remove('show');
	},

	outputHeading: function(e){
		if(Number.isFinite(e.webkitCompassHeading) && Math.floor(e.webkitCompassHeading) != lastCompassHeading){
			this.heading = Math.floor(e.webkitCompassHeading);
			this.showValue(this.elements.heading, e.webkitCompassHeading, true);
			if(this.hasLocation && this.icon) this.icon.setRotationAngle(e.webkitCompassHeading);
		}else{
			this.valueFailed(this.elements.heading);
		}
	},

	setAirports: function(e){
		this.airports = e;
	},

	moveMapToCurrentLocation: function(){
		if(this.hasLocation){
			this.map.setView(
				new L.LatLng(this.latitude, this.longitude), 
				4, 
				{animate: true}
			);
		}
	}
};

aeromap.init();

functions.loadJSON('/dist/json/geojson_small.json', function(e){
	aeromap.applyGeoJSON(e);
	aeromap.applyMarker();
});

functions.loadJSON('/dist/json/majorcities.json', function(e){
	aeromap.cities = e;
	document.dispatchEvent(new CustomEvent("citiesLoaded"));
});

functions.loadJSON('/dist/json/airports.json', function(e){
	aeromap.setAirports(e);
	document.dispatchEvent(new CustomEvent("searchLoaded"));
});

aeromap.elements.locationBtn.addEventListener('click', function(){
	aeromap.moveMapToCurrentLocation();
});

aeromap.elements.settingsBtn.addEventListener('click', function(){
	if(!aeromap.elements.body.classList.contains('show-settings')) aeromap.elements.body.classList.add('show-settings');
});

aeromap.elements.settingsOverlay.addEventListener('click', function(){
	if(aeromap.elements.body.classList.contains('show-settings')) aeromap.elements.body.classList.remove('show-settings');
});

aeromap.elements.settingsModal.querySelector('.close-btn').addEventListener('click', function(){
	if(aeromap.elements.body.classList.contains('show-settings')) aeromap.elements.body.classList.remove('show-settings');
})

document.addEventListener('mapLoaded', function(e){
	aeromap.hideMapLoading();
});

document.addEventListener("searchLoaded", function(e){
	
});

document.addEventListener("citiesLoaded", function(e){
	aeromap.getCity();
});

window.addEventListener('deviceorientation', function(e) {
	aeromap.outputHeading(e);
}, false);

setTimeout(function(){
	if(aeromap.heading === null) aeromap.valueFailed(aeromap.elements.heading);
})




