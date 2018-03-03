import Component from '../../src/js/component'
import * as Leaflet from 'leaflet'
import LocationService from '../../src/js/LocationService'
import * as MapTiles from '../../src/json/geojson_small.json'

export class AeromapMap extends Component {
    static tag = 'aeromap-map'
    LocationService: LocationService
    defaultZoom: number = 10
    defaultLocation: Coordinates = new Coordinates()
    map: any

    // static dependencies = [
    //     LocationService
    // ]

    connectedCallback() {
        this.LocationService = new LocationService()
        this.innerHTML = ''
        this.initialiseMap()

        this.LocationService.requestPosition()
            .then((location) => {
                this.setToCurrentLocation()
            })
    }

    initialiseMap () {
        this.map = Leaflet.map(this)
        this.applyTiles()
        this.setToDefaultLocation()
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
        this.setToLocation(this.LocationService.latestPosition)
    }

    setToDefaultLocation () {
        this.setToLocation(this.defaultLocation)
    }

    setToLocation (coordinates: Coordinates) {
        this.map.setView(
            this.makeLatLng(coordinates)
        )
    }

    setZoom (zoom: number) {
        this.map.setZoom(zoom)
    }

    setToDefaultZoom () {
        this.setZoom(this.defaultZoom)
    }
}