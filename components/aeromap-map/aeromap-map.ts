import Component from '../../src/js/component'
import * as Leaflet from 'leaflet'
import LocationService from '../../src/js/LocationService'
import * as MapTiles from '../../src/json/geojson_small.json'

export class AeromapMap extends Component {
    static tag = 'aeromap-map'
    LocationService: LocationService
    defaultZoom: number = 10
    map: any

    // static dependencies = [
    //     LocationService
    // ]

    connectedCallback() {
        this.LocationService = new LocationService()
        this.innerHTML = ''

        this.LocationService.requestPosition()
            .then((location) => {
                console.log(location)
                this.initialiseMap()
            })
    }

    initialiseMap () {
        this.map = Leaflet.map(this)// .setLatLng(this.LocationService.latestPosition)
        console.log(this.map)
        this.applyTiles()
        this.setToCurrentLocation()
        this.setToDefaultZoom()
    }

    applyTiles () {
        Leaflet.geoJson(MapTiles).addTo(this.map)
    }

    makeLatLng (coordinates: Coordinates) {
        return Leaflet.latLng(
            coordinates.latitude,
            coordinates.longitude
        )
    }

    setToCurrentLocation () {
        this.map.setView(
            this.makeLatLng(this.LocationService.latestPosition)
        )
    }

    setToDefaultZoom () {
        this.map.setZoom(this.defaultZoom)
    }
}