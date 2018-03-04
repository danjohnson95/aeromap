import Component from '../../src/js/component'

export class AeromapStats extends Component {
    static tag = 'aeromap-stats'

    _latitude: number
    _longitude: number
    _altitude: number
    _speed: number
    _heading: number
    closestCity: string

    static get observedAttributes() {
        return [
            'lat', 'lng', 'heading', 'speed', 'altitude'
        ]
    }

    set latitude (latitude: number) {
        this._latitude = latitude
        this.calculateClosestCity()
        this.renderHTML()
    }

    set longitude (longitude: number) {
        this._longitude = longitude
        this.calculateClosestCity()
        this.renderHTML()
    }

    set speed (speed: number) {
        this._speed = speed
        this.renderHTML()
    }

    set altitude (altitude: number) {
        this._altitude = altitude
        this.renderHTML()
    }

    set heading (heading: number) {
        this._heading = heading
        this.renderHTML()
    }

    get speed (): number {
        return this._speed
    }

    get altitude (): number {
        return this._altitude
    }

    get heading (): number {
        return this._heading
    }

    attributeChangedCallback (name: string, oldVal: string, newVal: string) {
        const parsedVal = JSON.parse(newVal)

        switch (name) {
            case 'lat':
                this.latitude = parsedVal
                this.calculateClosestCity()
                break
            case 'lng':
                this.longitude = parsedVal
                this.calculateClosestCity()
                break
            case 'speed':
                this.speed = parsedVal
                break
            case 'heading':
                this.heading = parsedVal
                break
            case 'altitude':
                this.altitude = parsedVal
        }

        this.renderHTML()
    }

    connectedCallback () {
        this.renderHTML()
    }

    calculateClosestCity () {

    }

    renderHTML () {
        this.innerHTML = `
            <div>
                <div>
                    <span>Altitude</span>
                    <strong>` + this.altitude + `</strong>
                </div>
                <div>
                    <span>Speed</span>
                    <strong>` + this.speed + `</strong>
                </div>
                <div>
                    <span>Heading</span>
                    <strong>` + this.heading + `</strong>
                </div>
            </div>
            <div>
                <div>
                    <span>Closest City</span>
                    <strong>` + this.closestCity + `</strong>
                </div>
            </div>`
    }
}