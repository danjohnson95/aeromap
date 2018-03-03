import Service from './Service'

export default class LocationService extends Service {
    latestPosition: Coordinates

    static ServiceName = 'LocationService'

    isLocationSupported (): boolean {
        return "geolocation" in navigator
    }

    requestPosition (): Promise<Coordinates>
    {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    this.latestPosition = location.coords
                    resolve(this.latestPosition)
                },

                (error) => reject(error) 
            )
        })
    }
}