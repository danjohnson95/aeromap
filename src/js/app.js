var leaflet = require('leaflet');
require('Leaflet.Geodesic');
require('leaflet-rotatedmarker');
var functions = require('./functions.js');

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
		settingsModal: null,
		setRouteBtn: null,
		homescreenHelp: null
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

	route: {
		origin: {
			lat: null,
			lng: null
		},
		dest: {
			lat: null,
			lng: null
		}
	},

	convert: {
		speed: "m/s",
		altitude: "ft"
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

		this.getElements(this.tryLocation);

		this.toggleHomescreenHelp();
	},

	getElements: function(next){
		this.elements.stats = document.getElementById('stats');
		this.elements.body = document.getElementsByTagName('body')[0];
		this.elements.mapLoading = document.getElementById('mapload');
		this.elements.buttons = this.elements.body.querySelector('.buttons');
		this.elements.retryBtn = stats.querySelector('.retry-position');
		this.elements.altitude = stats.querySelector('.altitude');
		this.elements.heading = stats.querySelector('.heading');
		this.elements.speed = stats.querySelector('.speed');
		this.elements.city = stats.querySelector('.city');
		this.elements.locationBtn = this.elements.buttons.querySelector('.move-map');
		this.elements.settingsBtn = this.elements.buttons.querySelector('.settings');
		this.elements.settingsOverlay = document.getElementById('settings-overlay');
		this.elements.settingsModal = document.getElementById('settings-modal');
		//this.elements.setRouteBtn = document.getElementById('set-route-btns');
		this.elements.homescreenHelp = document.getElementById('homescreen-help');
		next();
	},

	tryLocation: function(){
		if(navigator.geolocation){
			if(!aeromap.first){
				navigator.geolocation.clearWatch(this.watchID);
				var elements = [
					aeromap.elements.altitude, 
					aeromap.elements.heading, 
					aeromap.elements.speed, 
					aeromap.elements.city
				];

				for(i=0;i<elements.length;i++){
					aeromap.resetValue(elements[i]);
				}

				if(aeromap.elements.body.classList.contains('location-err')) aeromap.elements.body.classList.remove('location-err');
			}

			aeromap.watchID = navigator.geolocation.watchPosition(function(e){
				aeromap.latitude = e.coords.latitude;
				aeromap.longitude = e.coords.longitude;
				aeromap.altitude = e.coords.altitude;
				aeromap.speed = e.coords.speed;

				aeromap.showPosition();

			}, function(e){
				if(!aeromap.elements.body.classList.contains('location-err')) aeromap.elements.body.classList.add('location-err');
				if(!aeromap.elements.locationBtn.classList.contains('disable')) aeromap.elements.locationBtn.classList.add('disable');
				aeromap.resetTimer = setTimeout(aeromap.tryLocation, 5000);
			});
		}else{
			// Location not supported
		}
	},


	showPosition: function(){
		this.hasLocation = true;
		if(this.elements.locationBtn.classList.contains('disable')) this.elements.locationBtn.classList.remove('disable');
		if(this.initialFind) this.moveMapToCurrentLocation();
		this.initialFind = false;
		this.removeLocationErr();

		this.getCity();

		this.applyMarker();

		if(this.altitude === null){
			this.valueFailed(this.elements.altitude); 
		}else{
			this.showUnit(this.elements.altitude, this.convert.altitude);
			this.showValue(this.elements.altitude, this.convertAltitude(), false);
		}

		if(this.speed === null){
			this.valueFailed(this.elements.speed); 
		}else{
			this.showUnit(this.elements.speed, this.convert.speed);
			this.showValue(this.elements.speed, this.convertSpeed(), false);
		}
	},

	removeLocationErr: function(){
		if(this.elements.body.classList.contains('location-err')) this.elements.body.classList.remove('location-err');
	},

	convertSpeed: function(){
		switch(this.convert.speed){
			case 'mph':
				return Math.floor(this.speed * 2.23694);
			case 'kmh':
				return Math.floor(this.speed * 3.6);
			case 'mach':
				return (this.speed * 0.00130332).toFixed(3);
			default:
				return (this.speed).toFixed(1);
		}
	},

	convertAltitude: function(){
		switch(this.convert.altitude){
			case 'ft':
				return Math.floor(this.altitude);
			case 'meters':
				return Math.floor(this.altitude * 0.3048);
			case 'miles':
				return (this.altitude * 0.000189394).toFixed(1);
			default:
				return Math.floor(this.altitude);
		}
	},

	getCity: function(){
		if(this.latitude !== null && this.cities){
			this.city = this.nearestCity();
			this.showValue(this.elements.city, this.city, false);
		}
	},

	valueFailed: function(element){
		unit = element.querySelector('.unit');
		element = element.querySelector('.value');
		if(!unit.classList.contains('hide')) unit.classList.add('hide');
		if(element.classList.contains('loading')) element.classList.remove('loading');
		if(!element.classList.contains('failed')) element.classList.add('failed');
		element.innerHTML = "";
	},

	resetValue: function(element){
		unit = element.querySelector('.unit');
		element = element.querySelector('.value');
		if(!unit.classList.contains('hide')) unit.classList.add('hide');
		if(!element.classList.contains('loading')) element.classList.add('loading');
		if(element.classList.contains('failed')) element.classList.remove('failed');
		element.innerHTML = "";
	},

	showValue: function(element, value, flatten){
		element = element.querySelector('.value');
		if(element.classList.contains('loading')) element.classList.remove('loading');
		if(element.classList.contains('failed')) element.classList.remove('failed');
		element.innerHTML = (flatten ? Math.floor(value) : value);
	},

	showUnit: function(element, value){
		element = element.querySelector('.unit');
		if(element.classList.contains('hide')) element.classList.remove('hide');
		element.innerHTML = value;
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
		if(this.hasLocation && !this.icon){
			this.icon = L.marker([this.latitude, this.longitude], {
				icon: this.planeIcon,
				rotationOrigin: 'center center'
			}).addTo(this.map);
		}else if(this.hasLocation){
			this.icon.setLatLng([this.latitude, this.longitude]);
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
		if(Number.isFinite(e.webkitCompassHeading)){
			if(Math.floor(e.webkitCompassHeading) != this.heading){
				this.heading = Math.floor(e.webkitCompassHeading);
				this.showValue(this.elements.heading, e.webkitCompassHeading, true);
				if(this.hasLocation && this.icon) this.icon.setRotationAngle(e.webkitCompassHeading);
			}
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
	},

	setRoute: function(route){
		localStorage.route = route;
		if(!this.path) this.createGeodesic();
		if(route == 1){
			this.route.origin.lat = 51.1537;
			this.route.origin.lng = 0.1821;
			this.route.dest.lat = 21.0403;
			this.route.dest.lng = -86.8736;
		}else{
			this.route.origin.lat = 21.0403;
			this.route.origin.lng = -86.8736;
			this.route.dest.lat = 19.4361;
			this.route.dest.lng = -99.0719;
		}
		this.moveGeodesic();
		if(aeromap.elements.body.classList.contains('show-settings')) aeromap.elements.body.classList.remove('show-settings');
	},

	clearRoute: function(){
		localStorage.route = 0;
		this.path._path.remove();
		this.path = null;
		if(aeromap.elements.body.classList.contains('show-settings')) aeromap.elements.body.classList.remove('show-settings');
	},

	inAppMode: function(){
		if (("standalone" in window.navigator) && window.navigator.standalone || !("standalone" in window.navigator)){
			return true;
		}else{
			return false;
		}
	},

	toggleHomescreenHelp: function(){
		if(!this.inAppMode()){
			console.log('not in app mode');
			if(this.elements.homescreenHelp.classList.contains('hide')) this.elements.homescreenHelp.classList.remove('hide');
			if(!this.elements.body.classList.contains('show-overlay')) this.elements.body.classList.add('show-overlay');
		}else{
			console.log('app mode!');
			if(!this.elements.homescreenHelp.classList.contains('hide')) this.elements.homescreenHelp.classList.add('hide');
			if(this.elements.body.classList.contains('show-overlay')) this.elements.body.classList.remove('show-overlay');
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
});

aeromap.elements.settingsModal.querySelector('#altitude-unit').addEventListener('change', function(){
	aeromap.convert.altitude = this.value;
	if(aeromap.hasLocation) aeromap.showPosition();
});

aeromap.elements.settingsModal.querySelector('#speed-unit').addEventListener('change', function(){
	aeromap.convert.speed = this.value;
	if(aeromap.hasLocation) aeromap.showPosition();
});

/*aeromap.elements.setRouteBtn.addEventListener('click', function(e){
	
	children = document.getElementsByClassName('set-route');
	for(i=0;i<children.length;i++){
		if(children[i].classList.contains('active')) children[i].classList.remove('active');
	}
	if(e.target.classList.contains('route-clear')){
		aeromap.clearRoute();
	}else{
		e.target.classList.add('active');
		aeromap.setRoute(e.target.classList.contains('route-1') ? 1 : 2);
	}
	
});*/

document.addEventListener('mapLoaded', function(e){
	aeromap.hideMapLoading();

	/*if(localStorage.route == 1 || localStorage.route == 2){
		aeromap.setRoute(localStorage.route);
		if(localStorage.route == 1){
			document.querySelector('#set-route-btns .set-route.route-1').classList.add('active');
		}else if(localStorage.route == 2){
			document.querySelector('#set-route-btns .set-route.route-2').classList.add('active');
		}
	}*/
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




