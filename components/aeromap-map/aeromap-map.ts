import Component from '../../src/js/component'
import * as Leaflet from 'leaflet'
import LocationService from '../../src/js/LocationService'
import * as MapTiles from '../../src/json/geojson_small.json'
import MarkerIconStandard from '../../src/img/marker-icon.png'
import MarkerIconRetina from '../../src/img/marker-icon-2.png'

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
    marker: any
    map: any

    // static dependencies = [
    //     LocationService
    // ]

    connectedCallback() {
        this.LocationService = new LocationService()
        this.innerHTML = ''
        this.initialiseMap()

        this.LocationService.requestPosition()
        this.LocationService.watchForChanges()

        this.LocationService.addListener('positionChanged', (position) => {
            this.setToCurrentLocation()

            if (this.hasMarkerBeenApplied()) {
                this.setMarkerToCurrentLocation()
            } else {
                this.applyMarker()
            }
        })
    }

    generateMarker () {
        return Leaflet.icon({
		    iconUrl: MarkerIconStandard,
		    iconRetinaUrl: MarkerIconRetina,
		    iconAnchor: [15, 15],
		    iconSize: [30, 30]
		});
    }

    initialiseMap () {
        this.map = Leaflet.map(this)

        this.applyTiles()
            .setToDefaultLocation()
            .setToDefaultZoom()
    }

    hasMarkerBeenApplied (): boolean {
        return !!this.marker
    }

    applyMarker (): this {
        const location = this.makeLatLng(
            this.LocationService.latestPosition
        )

        const markerOptions = {
            icon: this.generateMarker(),
            rotationOrigin: 'center center'
        }

        this.marker = Leaflet.marker(location, markerOptions).addTo(this.map)

        return this
    }

    applyTiles (): this {
        Leaflet.geoJson(MapTiles).addTo(this.map)

        return this
    }

    makeLatLng (coordinates: Coordinates) {
        return Leaflet.latLng(
            coordinates.latitude,
            coordinates.longitude
        )
    }

    setToCurrentLocation (): this {
        this.setToLocation(this.LocationService.latestPosition)

        return this
    }

    setToDefaultLocation (): this {
        this.setToLocation(this.defaultLocation)

        return this
    }

    setToLocation (coordinates: Coordinates): this {
        this.map.setView(
            this.makeLatLng(coordinates)
        )

        return this
    }

    setZoom (zoom: number): this {
        this.map.setZoom(zoom)

        return this
    }

    setToDefaultZoom (): this {
        this.setZoom(this.defaultZoom)

        return this
    }

    setMarkerToCurrentHeading (): this {
        this.setMarkerHeading(
            this.LocationService.latestPosition.heading
        )

        return this
    }

    setMarkerHeading (heading: Number): this {
        this.marker.setRotationAngle(heading)

        return this
    }

    setMarkerToCurrentLocation (): this {
        this.setMarkerToLocation(
            this.LocationService.latestPosition
        )

        return this
    }

    setMarkerToLocation (coordinates: Coordinates): this {
        const location = this.makeLatLng(coordinates)

        this.marker.setLatLng(location)

        return this
    }
}