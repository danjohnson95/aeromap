import Component from '../../src/js/component'
import * as Leaflet from 'leaflet'
import LocationService from '../../src/js/LocationService'
import * as MapTiles from '../../src/json/geojson_small.json'

class DefaultCoordinates implements Coordinates {
    readonly accuracy: number = 0
    readonly altitude: number | null = 0
    readonly altitudeAccuracy: number | null = 0
    readonly heading: number | null = 0
    readonly latitude: number = 0
    readonly longitude: number = 0
    readonly speed: number | null = 0
}

export class AeromapMap extends Component {
    static tag = 'aeromap-map'
    LocationService: LocationService
    defaultZoom: number = 10
    defaultLocation: Coordinates = new DefaultCoordinates()
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