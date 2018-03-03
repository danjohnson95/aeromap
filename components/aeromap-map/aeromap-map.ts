import Component from '../../src/js/component'
import * as Leaflet from 'leaflet'
import * as MapTiles from '../../src/json/geojson_small.json'
import MarkerIconStandard from '../../src/img/marker-icon.png'
import MarkerIconRetina from '../../src/img/marker-icon-2.png'

export class AeromapMap extends Component {
    static tag = 'aeromap-map'
    defaultZoom: number = 10
    marker: any
    map: any

    latitude: number
    longitude: number
    heading: number

    connectedCallback() {
        this.innerHTML = ''
        this.initialiseMap()
    }

    static get observedAttributes() {
        return [
            'lat', 'lng'
        ]
    }

    attributeChangedCallback (name: string, oldVal: string, newVal: string) {
        const parsedVal = JSON.parse(newVal)

        switch (name) {
            case 'lat':
                this.latitude = parsedVal
                break
            case 'lng':
                this.longitude = parsedVal
        }

        this.setToCurrentLocation()

        if (this.hasMarkerBeenApplied()) {
            this.setMarkerToCurrentLocation()
        } else {
            this.applyMarker()
        }
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
            this.latitude, this.longitude
        )

        const markerOptions = {
            icon: this.generateMarker(),
            rotationOrigin: 'center center'
        }

        this.marker = Leaflet.marker(location, markerOptions).addTo(this.map)
        // this.setMarkerToCurrentHeading()

        return this
    }

    applyTiles (): this {
        Leaflet.geoJson(MapTiles).addTo(this.map)

        return this
    }

    makeLatLng (lat: Number, lng: Number) {
        return Leaflet.latLng(lat, lng)
    }

    setToCurrentLocation (): this {
        this.setToLocation(this.latitude, this.longitude)

        return this
    }

    setToDefaultLocation (): this {
        this.setToLocation(0, 0)//this.defaultLocation)

        return this
    }

    setToLocation (lat: Number, lng: Number): this {
        this.map.setView(
            this.makeLatLng(lat, lng)
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
        this.setMarkerHeading(this.heading)

        return this
    }

    setMarkerHeading (heading: Number): this {
        console.log(this.marker)
        this.marker.setRotationAngle(heading)

        return this
    }

    setMarkerToCurrentLocation (): this {
        this.setMarkerToLocation(
            this.latitude, this.longitude
        )

        return this
    }

    setMarkerToLocation (lat: Number, lng: Number): this {
        const location = this.makeLatLng(lat, lng)

        this.marker.setLatLng(location)

        return this
    }
}