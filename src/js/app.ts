// import Component from './component'
import Service from './Service'

export default class App {
    components: any[]// = []//: HTMLElement[] = []
    services: any[]

    setServices (services: any[]): this {
        this.services = []

        services.forEach((service) => {
            this.services.push(
                service
            )
        })

        return this
    }

    _getService (serviceName: string): Service {
        return this.services.some((service) => {
            console.log(service)
            console.log(service.ServiceName, serviceName)
            return service.ServiceName === serviceName
        })
    }

    _handleServiceInjection(component: any) {
        component.dependencies.forEach((dependency: any) => {
            console.log(dependency.ServiceName)
            let service = this._getService(dependency.ServiceName)
            console.log('GOT SERVICE')
            console.log(service)
        })
    }

    setComponents(components: any[]): this {
        this.components = components
        this.registerComponents()

        return this
    }

    registerComponents () {
        this.components.forEach((component) => this._registerComponent(component))
    }

    _registerComponent (component: any) {
        // if (component._hasDependencies()) {
        //     this._handleServiceInjection(component)
        // }

        window.customElements.define(
            component.tag,
            component
        )
    }
}
