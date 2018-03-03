import App from './app'

// Components
import { AeromapApp } from '../../components/aeromap-app/aeromap-app'
import { AeromapMap } from '../../components/aeromap-map/aeromap-map'

// Services
import LocationService from './LocationService'

const aeromap = new App

// aeromap.setServices([
//     new LocationService
// ])

aeromap.setComponents([
    AeromapApp,
    AeromapMap
])