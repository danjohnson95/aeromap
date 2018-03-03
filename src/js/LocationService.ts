import Service from './Service'
import { EventEmitter } from 'events';

export default class LocationService extends EventEmitter {
    _latestPosition: Coordinates
    watchId: number

    static ServiceName = 'LocationService'

    isLocationSupported (): boolean {
        return "geolocation" in navigator
    }

    set latestPosition (position: Coordinates) {
        this._latestPosition = position
        this.emit('positionChanged')
    }

    get latestPosition (): Coordinates {
        return this._latestPosition
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

    watchForChanges (): void
    {
        this.watchId = navigator.geolocation.watchPosition(
            (location) => {
                this.latestPosition = location.coords
            },
            // (error) => reject(error)
        )
    }

    stopWatchingForChanges (): void {
        navigator.geolocation.clearWatch(this.watchId)
    }
 
}