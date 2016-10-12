var $ = require('jquery');
var leaflet = require('leaflet');
require('Leaflet.Geodesic');
require('leaflet-rotatedmarker');

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

    $.getJSON('/dist/json/geojson_small.json', function(data){
        L.geoJson(data, {
            style: style
        }).addTo(map);
        geoJsonLoaded = true;
        $(document).trigger('ajaxLoaded');
    });

	var cities = [];
    $.ajax({
        url:'/dist/json/capitol.json',
        success: function(json){
            $.each(json, function(e, i){
                cities.push([i.CapitalName, i.CapitalLatitude, i.CapitalLongitude, i.CountryName]);
            });
            citiesLoaded = true;
            $(document).trigger('ajaxLoaded');
        }
    });

    var airports = [];
    $.ajax({
    	url:'/dist/json/airports.json',
    	success: function(json){
    		airports = json;
    		$(document).trigger('searchLoaded');
    	},
    	error: function(e){
    		console.log(e);
    	}
    });

    geodesic.setLatLngs([
    	[
    		new L.LatLng(51.505, -0.09),
    		new L.LatLng(33.82, -118.38)
    	]
	]);

	$(document).on('searchLoaded', function(){
		console.log('search ready!');
	});


	if(navigator.geolocation){
		$(document).on('ajaxLoaded', function(){
			if(geoJsonLoaded && citiesLoaded)
				navigator.geolocation.getCurrentPosition(showPosition);
		});
	}else{
            alert('not supported');
	}

	var stats = document.getElementById('stats');
	var altitude = stats.querySelector('.altitude .value');
	var heading = stats.querySelector('.heading .value');
	var speed = stats.querySelector('.speed .value');
	var city = stats.querySelector('.city .value');

	var icon = null;

	window.addEventListener('deviceorientation', function(e) {
    	heading.innerHTML = Number.isInteger(e.webkitCompassHeading) ? Math.floor(e.webkitCompassHeading) : "?"
        if(icon && heading.innerHTML != "?") icon.setRotationAngle(e.webkitCompassHeading);
	}, false);

	function showPosition(position){
		console.log(position);

		icon = L.marker([position.coords.latitude, position.coords.longitude], {
			icon: planeIcon, 
			rotationOrigin: 'center center'
		}).addTo(map);
		map.panTo(L.latLng([position.coords.latitude, position.coords.longitude]));

		altitude.innerHTML = position.coords.altitude ? Math.floor(position.coords.altitude) : "?";
		if(altitude.classList.contains('loading')) altitude.classList.remove('loading');
		heading.innerHTML = position.coords.heading ? Math.floor(position.coords.heading) : "?";
		if(heading.classList.contains('loading')) heading.classList.remove('loading');
		speed.innerHTML = position.coords.speed !== null ? Math.floor((position.coords.speed * 2.237)) : "?";
		if(speed.classList.contains('loading')) speed.classList.remove('loading');
		city.innerHTML = NearestCity(position.coords.latitude, position.coords.longitude);
		if(city.classList.contains('loading')) city.classList.remove('loading');		
	}

	// Convert Degress to Radians
	function Deg2Rad(deg) {
	  return deg * Math.PI / 180;
	}

	function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
	  lat1 = Deg2Rad(lat1);
	  lat2 = Deg2Rad(lat2);
	  lon1 = Deg2Rad(lon1);
	  lon2 = Deg2Rad(lon2);
	  var R = 6371; // km
	  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
	  var y = (lat2 - lat1);
	  var d = Math.sqrt(x * x + y * y) * R;
	  return d;
	}

	var lat = 20; // user's latitude
	var lon = 40; // user's longitude

	function NearestCity(latitude, longitude) {
	  var mindif = 99999;
	  var closest;

	  for (index = 0; index < cities.length; ++index) {
	    var dif = PythagorasEquirectangular(latitude, longitude, cities[index][1], cities[index][2]);
	    if (dif < mindif) {
	      closest = index;
	      mindif = dif;
	    }
	  }

	  return [cities[closest][0], cities[closest][3]];
	}

	function loadJSON(url, callback, errCallback){
		if(!errCallback) errCallback = null;
		var xobj = new XMLHttpRequest();
			xobj.overrideMimeType('application/json');
		xobj.open('GET', url, true);
		xobj.onreadystatechange = function(){
			if(xobj.readyState == 4 && xobj.status == "200"){
				callback(xobj.responseText);
			}else{
				errCallback(xobj.responseText);
			}
		};
		xobj.send(null);
	}
