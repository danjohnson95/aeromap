var location = {

	functions: {},
	geoJsonLoaded: false,
	map: null,
	mapStyle: {
		stroke: false,
		fill: true,
		fillColor: '#000',
		fillOpacity: 0.15
	},
	geodesic: null,

	location: function(e){
		this.functions = e;
	},

	init: function(next){
		this.map = L.map('map', {
			center: [51.505, -0.09],
			zoom: 4
		});
		this.getAndApplyGeoJSON(next);

	},

	start: function(){
		if(navigator.geolocation){
			navigator.geolocation.watchPosition(function(e){
				document.addEventListener('ajaxLoaded', function(e){
					if(geoJsonLoaded && citiesLoaded)
						showPosition(e);
				});
			}, this.positionNotFound);
			
		}else{
			this.positionFail();
		}
	},

	positonNotFound: function(){
		locationNotFound.classList.add('show');
	},

	positionFail: function(){
		locationFail.classList.add('show');
	},

	getAndApplyGeoJSON: function(next){

		console.log(this);
		
		this.functions.loadJSON('/dist/json/geojson_small.json', function(e){
			L.geoJson(e, {
	            style: this.mapStyle
	        }).addTo(this.map);
	        this.geoJsonLoaded = true;
	        next();
	    });
	},

	applyGeodesic: function(){
		this.geodesic = L.geodesic([], {
	    	weight: 2,
	    	opacity: 1,
	    	color: 'white',
	    	steps: 50
	    }).addTo(this.map);
	}


};

module.exports = location;