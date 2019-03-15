import { Component, OnInit, ViewEncapsulation, Input, AfterViewInit } from '@angular/core';
import { Search } from '../../../client/datamodel/search';
import { Group } from '../../../client/datamodel/group';
import { SearchesService } from '../../../client/searches.service';
import { TracksService } from '../../../client/tracks.service';
import { GroupsService } from '../../../client/groups.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { BaseLayerService } from 'src/app/client/baselayers.service';
import { BaseLayer } from 'src/app/client/datamodel/baselayer';
import { Area } from 'src/app/client/datamodel/area';
import { reverseMultipolygon } from '../../../utils/utils';
import { TracksComponent } from './tracks/tracks.component';
import { NavBarComponent } from '../../navbar/navbar.component';
import { environment } from '../../../../environments/environment';
declare var L: any;

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  providers: [SearchesService, TracksService, GroupsService, BaseLayerService],
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit, AfterViewInit {
  @Input() search: Search = null;
  @Input() navbar: NavBarComponent = null;
  groups: Group[] = [];
  areas: Area[] = [];
  mymap: any;
  blayers: BaseLayer[] = [];
  timer: any //NodeJS.Timer;
  controlLayer: any=null; //control layer to control the visibility of the layers
  controlSearch: any=null; //control Search to markers active RAUL
  available_colors=['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#C0C0C0', '#800000', '#808000', '#008000', '#008080', '#000080',  '#800080', '#808080'];// list of available colors for polylines
  heatPointList=[]; //RAUL [37.185, -5.945], [37.186, -5.946], [37.187, -5.947], [37.187, -5.947], [37.188, -5.948]

  constructor(private groupsService: GroupsService,
    private tracksService: TracksService,
    private searchService: SearchesService,
    private baseLayerService: BaseLayerService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog) {

  }

  async updateTracks() {
    let self = this;
    for (let i = 0; i < this.groups.length; i++) {
      let group = this.groups[i];
      //updating the tracks
      let updatedTracks = await self.groupsService.getTracks(group.sid).toPromise();

      if (updatedTracks != null) {
        for (let j = 0; j < updatedTracks.length; j++) {
          let track = updatedTracks[j];
          track = this.addTrackToGroup(group, track);

          let newTrackDetails=[];
          if (!track.details || track.details.length == 0) {
            //we don't have nothing, lets obtain all the available details
            newTrackDetails = await self.tracksService.getDetails(track.sid).toPromise();
          } else {
            //we only obtain the last details we don't have
            let lastTrackDetail = track.details[track.details.length - 1];
            newTrackDetails = await self.tracksService.getLastDetails(track.sid, lastTrackDetail.creation).toPromise();
          }

          if (newTrackDetails != null && newTrackDetails.length > 0) {
            if (typeof track.details === 'undefined' || track.details == null) {
              track.details = [];
            }
            for (let k = 0; k < track.details.length; k++) {
              track.details[k].track = track;
            }
            track.details = track.details.concat(newTrackDetails);
            this.drawDetails(track, newTrackDetails);
          }
        }

      } else {
        (<any>group).tracks = [];
      }
    }
  }

  /**
   * @name showQR
   * @description show the QR codes for the search we are managing now
   */
  showQR() {
    window.open(`/qrcode/${this.search.sid}`, "_blank");
  }

  /**
   * @name addTrackToGroup
   * @description add a track to the group if it doesnt exist already
   * @param {Group} group the group to investigate
   * @param {Track} track the track to add to the group
   * @return {Track} the track added
   */
  addTrackToGroup(group, track) {
    for (let i = 0; i < group.tracks.length; i++) {
      if (group.tracks[i].uid === track.uid) {
        //it exists already
        return group.tracks[i];
      }
    }
    //new track, adding it to the group
    group.tracks.push(track);
    track.group = group;
    return track;
  }

  /**
   * @name loadTracks
   * @description load all the tracks info for the search we are visualizing
   */
  async loadTracks() {
    let self = this;
    this.groups = await this.searchService.getGroups(this.search.sid).toPromise();
    this.areas = await this.searchService.getAreas(this.search.sid).toPromise();
    for (let i = 0; i < this.groups.length; i++) {
      let group = this.groups[i];
      (<any>group).tracks = await self.groupsService.getTracks(group.sid).toPromise();
      if ((<any>group).tracks != null) {
        for (let j = 0; j < (<any>group).tracks.length; j++) {
          let track = (<any>group).tracks[j];
          track.group = group;
          track.details = await self.tracksService.getDetails(track.sid).toPromise();
          if (track.details == null) {
            track.details = [];
          }
          for (let k = 0; k < track.details.length; k++) {
            track.details[k].track = track;
          }
        }
      } else {
        (<any>group).tracks = [];
      }
    }
  }

  ngOnInit(): void {
    this.startLoading();
  }

  ngAfterViewInit(): void {
    this.navbar.map = this
  }

  ngOnDestroy(): void {
    if (this.timer != null) {
      console.log("clearing interval");
      clearInterval(this.timer);
    }
  }

  async startLoading() {
    this.blayers = await this.baseLayerService.getAll().toPromise();
    this.loadMap();
    await this.loadTracks();
    await this.addTracksDetails();
    //important to get the correct size of the map
    this.mymap.invalidateSize();

    //scheduling updates every 5 seconds
    if (this.timer != null) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => { this.updateTracks() }, 5000);
  }

  private loadMap() {
    console.log("loading map");
    this.mymap = L.map('mapid').setView([37.38, -4.77], 8);
    //this.controlLayer = new L.Control.Layers(null, null, { position: 'topright' }).addTo(this.mymap);
    this.controlLayer = new L.Control.styledLayerControl(null, null, { position: 'topright'}).addTo(this.mymap); //toggler:true

    this.controlSearch = new L.Control.Search({layer: null, propertyName: null}).addTo(this.mymap); // RAUL

    this.blayers.forEach((layer) => {
      let tileLayer = new L.TileLayer.WMS(layer.url, {
        layers: layer.layers,
        format: layer.format,
        minZoom: layer.minZoom,
        maxZoom: layer.maxZoom,
        transparent: layer.transparent,
        continuousWorld: layer.continousWorld,
        attribution: layer.attribution
      }).addTo(this.mymap);
      //this.controlLayer.addBaseLayer(tileLayer, layer.name);
      this.controlLayer.addBaseLayer(tileLayer, layer.name, {groupName : "Base Layers", expanded: false});
    });
    new L.Control.Scale().addTo(this.mymap);
    new L.Control.BrowserPrint().addTo(this.mymap); //print map
  }

  /**
   * @name getNewColor
   * @description return the next available color to be used
   * @return {string} the color
   */
  private getNewColor(active, group):string{
    if ( active == true) {
        if (typeof group.color == 'undefined' || group.color == null) {
        let color = this.available_colors[0];
        this.available_colors.splice(this.available_colors.length, 0, color);
        this.available_colors.splice(0,1);
        group.color=color;
        return color
      }else {
        return group.color
      }
    }
    else {
      return 'black'
    }
  }

  /**
   * @name SizeIcono
   * @description returns the size of the icon depending on whether it is main or not
   *
   */
  private SizeIcono(d) {
    if (d == true){
      return [42, 42]
    }else {
      return [28, 28]
    }
  }

  /**
   * @name getWeight
   * @description returns polyline width depending on whether the track is main or not
   *
   */
  private getWeight(d) {
    if (d == true){
      return 8
    }else {
      return 4
    }
  }

  private drawDetails(track, newDetails) {
    console.log("Update loading details");
  
    let pointList = [];
    
    for (let i = 0; i < newDetails.length; i++) {
      let detaili=newDetails[i];
      
      let info = JSON.parse(detaili.trackinfo);
      let pointX = new L.LatLng(info.coordinates[1], info.coordinates[0]);
      pointList.push(pointX);

      
      this.heatPointList.push(pointX);

      for (let j = 0; j < detaili.datas.length; j++) { //revisar con Jose
        if (detaili.datas[j].ref != null || detaili.datas[j].comments != null) {
          if (track.group.active == true){
            let Icono = new L.Icon({iconUrl: 'src/assets/img/notification.svg'});
            let urlPhoto=`${environment.apiUrl}/photo/${detaili.datas[j].sid}`;
            let notification = new L.Marker(pointX, {icon: Icono, riseOnHover: true}).
            bindPopup("<b><font color='blue'>" + "GRUPO: " + track.group.name +"  " + track.name + '<br/>' + detaili.creation + '<br/>' + detaili.trackinfo + "</font></b><div><img style='width:100%' src='" + urlPhoto + "'/></div><p>Comentario: " + detaili.datas[j].comments + "</p>",
            {minWidth:300}).openPopup();
            notification.addTo(this.mymap);
            this.controlLayer.addOverlay(notification, "<font color='blue'>Grupo: " + track.group.name +" "+ track.name + "</font>",{groupName : "<font color='blue'>Notification</font>", toggler: true});
          }else {
            let Icono = new L.Icon({iconUrl: 'src/assets/img/notification_In.svg'});
            let urlPhoto=`${environment.apiUrl}/photo/${detaili.datas[j].sid}`;
            let notification = new L.Marker(pointX, {icon: Icono, riseOnHover: true}).
            bindPopup("<b>" + "GRUPO: " + track.group.name +"  " + track.name + '<br/>' + detaili.creation + '<br/>' + detaili.trackinfo + "</b><div><img style='width:100%' src='" + urlPhoto + "'/></div><p>Comentario: " + detaili.datas[j].comments + "</p>",
            {minWidth:300}).openPopup();
            this.controlLayer.addOverlay(notification, "Grupo: " + track.group.name +" "+ track.name + " ",{groupName : "Notification", toggler: true});
          }
          
        }
      }
    }
      
    if (typeof track.polyline == 'undefined' || track.polyline == null) {
      //first time we create a polyline for the track

      if (track.group.active == true) {
      
        let firstpolyline = new L.Polyline(pointList, {
          color: this.getNewColor(track.group.active, track.group),
          weight: this.getWeight(track.main),
          opacity: 0.7,
          smoothFactor: 1
        });
        firstpolyline.addTo(this.mymap).bindTooltip("<font color='blue'>" + "GRUPO: " + track.group.name + '<br/>' + track.name + "</font>",{sticky: true});
        this.mymap.fitBounds(firstpolyline.getBounds());
        track.polyline = firstpolyline;
        //this.controlLayer.addOverlay(firstpolyline, track.group.name + '<br/>'+ track.name);
        this.controlLayer.addOverlay(firstpolyline, "<font color='blue'>" + track.name + " MAIN: " + track.main + "</font>",{groupName : "<font color='blue'>Tracks Grupo: " +track.group.name + "</font>", toggler: true});
      
        let Icono = new L.Icon({iconUrl: 'src/assets/img/activo2.svg', iconSize: this.SizeIcono(track.main), iconAnchor: [10, 15]});
        let marker = new L.Marker(pointList[pointList.length - 1],{icon: Icono, riseOnHover: true}).bindTooltip("<font color='blue'>" + "GRUPO: " + track.group.name + '<br/>' + track.name + "</font>" + '<br/>' + track.details[track.details.length-1].creation + '<br/>' + track.details[track.details.length-1].trackinfo);
        marker.addTo(this.mymap);
        //this.controlSearch.setLayer({layer: marker, propertyName: track.name}); //caja busqueda  RAUL
        this.controlLayer.addOverlay(marker, "<font color='blue'>" + track.name + " MAIN: " + track.main + "</font>",{groupName : "<font color='blue'>Last Position " + track.group.name + "</font>", toggler: true});
        track.marker=marker;

      } else {

        let firstpolyline = new L.Polyline(pointList, {
          color: this.getNewColor(track.group.active, track.group),
          weight: this.getWeight(track.main),
          opacity: 0.7,
          smoothFactor: 1
        }).bindTooltip(track.group.name + '<br/>' + track.name,{sticky: true});
        //firstpolyline.addTo(this.mymap).bindTooltip(track.group.name + '<br/>' + track.name,{sticky: true});
        //this.mymap.fitBounds(firstpolyline.getBounds()); ¿donde centramos mapa si no hay grupos activos?
        track.polyline = firstpolyline;
        this.controlLayer.addOverlay(firstpolyline, track.name + " MAIN: " + track.main,{groupName : "Tracks Grupo: " +track.group.name, toggler:true});
      
        let Icono = new L.Icon({iconUrl: 'src/assets/img/inactivo2.svg', iconSize: this.SizeIcono(track.main), iconAnchor: [10, 15]});
        let marker = new L.Marker(pointList[pointList.length - 1],{icon: Icono, riseOnHover: true}).bindTooltip("GRUPO: " + track.group.name + '<br/>' + track.name + '<br/>' + track.details[track.details.length-1].creation + '<br/>' + track.details[track.details.length-1].trackinfo);
        this.controlLayer.addOverlay(marker, track.name + " MAIN: " + track.main,{groupName : "Last Position " + track.group.name, toggler: true});
        track.marker=marker;

      }
      

    } else {
      //we have already an existent polyline          
      let currentLatLngs = track.polyline.getLatLngs();
      let updatedLatLngs = currentLatLngs.concat(pointList);
      track.polyline.setLatLngs(updatedLatLngs);
      track.marker.setLatLng(pointList[pointList.length-1]);
    }   

  }

  private addTracksDetails() {
    console.log("loading details");
    if (this.search.forwardCommandPost != null) { //JOSE revisar condicion ¿habria que incluir undufined?
      let IconoPMA = new L.Icon({iconUrl: 'src/assets/img/PMA.svg', iconSize: [38, 38]});
      let puntoPMA = JSON.parse(this.search.forwardCommandPost)
      let markerPMA = new L.Marker(puntoPMA.coordinates, {icon: IconoPMA, riseOnHover: true});
      markerPMA.addTo(this.mymap);
      this.controlLayer.addOverlay(markerPMA, "PMA",  {groupName : "Puntos Singulares"});
    }

    if (this.search.lastPointSighting != null){ //JOSE revisar condicion ¿habria que incluir undufined?
      let IconoUPA = new L.Icon({iconUrl: 'src/assets/img/UPA.svg', iconSize: [30, 30]});
      let puntoUPA = JSON.parse(this.search.lastPointSighting)
      let markerUPA = new L.Marker(puntoUPA.coordinates, {icon: IconoUPA, riseOnHover: true});
      //markerUPA.addTo(this.mymap);
      this.controlLayer.addOverlay(markerUPA, "UPA",  {groupName : "Puntos Singulares"});  
    }

    if (this.search.lastKnownPosition != null){ //JOSE revisar condicion ¿habria que incluir undufined?
      let IconoUPC = new L.Icon({iconUrl: 'src/assets/img/UPC.svg', iconSize: [30, 30]});
      let puntoUPC = JSON.parse(this.search.lastKnownPosition)
      let markerUPC = new L.Marker(puntoUPC.coordinates, {icon: IconoUPC, riseOnHover: true});
      //markerUPC.addTo(this.mymap);
      this.controlLayer.addOverlay(markerUPC, "UPC",  {groupName : "Puntos Singulares"});  
    }

    if (this.search.initialPlanningPoint != null){ //JOSE revisar condicion ¿habria que incluir undufined?
      let IconoPPI = new L.Icon({iconUrl: 'src/assets/img/PPI.svg', iconSize: [30, 30]});
      let puntoPPI = JSON.parse(this.search.initialPlanningPoint)
      let markerPPI = new L.Marker(puntoPPI.coordinates, {icon: IconoPPI, riseOnHover: true});
      //markerPPI.addTo(this.mymap);
      this.controlLayer.addOverlay(markerPPI, "PPI",  {groupName : "Puntos Singulares"});  
    }
    
    if (this.search.locationPointMissingPerson != null){ //JOSE revisar condicion ¿habria que incluir undufined?
      let IconoPLD = new L.Icon({iconUrl: 'src/assets/img/PLD.svg', iconSize: [30, 30]});
      let puntoPLD = JSON.parse(this.search.locationPointMissingPerson)
      let markerPLD = new L.Marker(puntoPLD.coordinates, {icon: IconoPLD, riseOnHover: true});
      //markerPLD.addTo(this.mymap);
      this.controlLayer.addOverlay(markerPLD, "PLD",  {groupName : "Puntos Singulares"});  
    }
    
    //load search areas, we have to decide whether to load individually or in groups
    //let allMultipolygons = [];
    for (let i = 0; i < this.areas.length; i++) {
      let multipolygon = JSON.parse(this.areas[i].zone);
      if (multipolygon != null) { //JOSE revisar condicion ¿habria que incluir undufined?
        reverseMultipolygon(multipolygon.coordinates);
        let multipolygonAreas = new L.Polygon(multipolygon.coordinates, {weight: 1.5, fill: false}).bindTooltip(this.areas[i].name, {permanent: false, sticky: false});
        //multipolygonAreas.addTo(this.mymap);
        this.controlLayer.addOverlay(multipolygonAreas,this.areas[i].name, {groupName : "Areas", toggler: true});
        //allMultipolygons.push(multipolygonAreas);
      }
    }

    let heatmap = new L.heatLayer(this.heatPointList, {radius: 15});
    //heatmap.addTo(this.mymap);
    this.controlLayer.addOverlay(heatmap, "HeatMap", {groupName : "HEATMAP", toggler: true});

    //let areasLayergroup = new L.LayerGroup(allMultipolygons);
    //areasLayergroup.addTo(this.mymap);
    //this.controlLayer.addOverlay(areasLayergroup, "Zonas Búsqueda");

    this.groups.forEach((group) => {
      (<any>group).tracks.forEach(track => {
        this.drawDetails(track, track.details);
      });
    });
    
  }

  /**
   * @name addBase
   * @description add a geojson for areas layer, selecting a file
   * 
   */
  addAreasLayer() {
    document.getElementById('file_selector').click();
  }

  /**
   * @name editTracks
   * @description edit device track info
   */
  editTracks() {
    let dialogRef = this.dialog.open(TracksComponent, {
      role: 'dialog',
      width: '800px',
      data: {
        search: this.search,
        groups: this.groups
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      //this.updateUsers();
    });

  }

  onFileChange(event) {
    let reader = new FileReader();
    if (event.target.files && event.target.files.length > 0) {
      let file = event.target.files[0];
      reader.readAsText(file);
      reader.onload = (data) => {
        let geojson = JSON.parse(<string>reader.result);
        console.log(reader.result);
        this.searchService.updateZone(this.search, geojson).subscribe((data) => {
          //done
          if (data.length > 0) {
            this.snackbar.open(data[0].message, "Error", {
              duration: 5000,
            });
          }
        });
      };
    }
  }
}



