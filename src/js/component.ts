export default class Component extends HTMLElement {
    static tag: string
    static dependencies: any[] = []

    static _hasDependencies () {
        return !!this.dependencies.length
    }
}