import Component from '../../src/js/component'
import LocationService from '../../src/js/LocationService'

export class AeromapApp extends Component {
    static tag = 'aeromap-app'

    LocationService: LocationService

    mapComponent: Component
    statsComponent: Component

    connectedCallback() {
        this.mapComponent = document.createElement('aeromap-map')
        this.statsComponent = document.createElement('aeromap-stats')

        this.LocationService = new LocationService
        this.LocationService.requestPosition()
        this.LocationService.watchForChanges()

        this.LocationService.addListener('positionChanged', () => {
            this.setLocationAttribute(this.mapComponent, this.statsComponent)
        })

        this.innerHTML = ``

        this.appendChild(this.mapComponent)
        this.appendChild(this.statsComponent)
    }

    setLocationAttribute (...components: Component[]): this {
        const position = this.LocationService.latestPosition

        const latitude = JSON.stringify(position.latitude)
        const longitude = JSON.stringify(position.longitude)
        const heading = JSON.stringify(position.heading)
        const speed = JSON.stringify(position.speed)
        const altitude = JSON.stringify(position.altitude)

        components.forEach((component) => {
            component.setAttribute('lat', latitude)
            component.setAttribute('lng', longitude)
            component.setAttribute('heading', heading)
            component.setAttribute('speed', speed)
            component.setAttribute('altitude', altitude)
        })

        return this
    }
}