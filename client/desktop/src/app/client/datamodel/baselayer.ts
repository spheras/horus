export class BaseLayer {

    constructor(sid: number, name: string,
        description: string, url: string,
        layers: string, format: string, minZoom: number,
        maxZoom: number, attribution: string,
        transparent: boolean, continousWorld: boolean) {
            
        this.sid = sid;
        this.name = name;
        this.description = description;
        this.url = url;
        this.layers = layers;
        this.format = format;
        this.minZoom = minZoom;
        this.maxZoom = maxZoom;
        this.attribution = attribution;
        this.transparent = transparent;
        this.continousWorld = continousWorld;
    }

    public sid: number;
    public name: string;
    public description: string;
    public url: string;
    public layers: string;
    public format: string;
    public minZoom: number;
    public maxZoom: number;
    public attribution: string;
    public transparent: boolean;
    public continousWorld: boolean;
}
