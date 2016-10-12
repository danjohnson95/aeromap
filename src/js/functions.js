var functions = {

	loadJSON: function(url, callback, errCallback){
		var xobj = new XMLHttpRequest();
			xobj.overrideMimeType('application/json');
		xobj.open('GET', url, true);
		xobj.onreadystatechange = function(){
			if(xobj.readyState == 4 && xobj.status == "200"){
				callback(JSON.parse(xobj.responseText));
			}else{
				if(arguments.length > 2){
					errCallback(xobj.responseText);
				}
			}
		};
		xobj.send(null);
	},

	Deg2Rad: function(deg) {
		return deg * Math.PI / 180;
	},

	PythagorasEquirectangular: function(lat1, lon1, lat2, lon2) {
	  lat1 = this.Deg2Rad(lat1);
	  lat2 = this.Deg2Rad(lat2);
	  lon1 = this.Deg2Rad(lon1);
	  lon2 = this.Deg2Rad(lon2);
	  var R = 6371; // km
	  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
	  var y = (lat2 - lat1);
	  var d = Math.sqrt(x * x + y * y) * R;
	  return d;
	}
};

module.exports = functions;
