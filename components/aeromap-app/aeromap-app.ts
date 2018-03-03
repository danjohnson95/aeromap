import Component from '../../src/js/component'
import LocationService from '../../src/js/LocationService'

export class AeromapApp extends Component {
    static tag = 'aeromap-app'

    connectedCallback() {
        this.innerHTML = '<aeromap-map></aeromap-map>'
        
    }
}