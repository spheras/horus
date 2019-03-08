import { Component, OnInit } from '@angular/core';
import { NavController, Platform, NavParams, AlertController, ToastController, normalizeURL } from 'ionic-angular';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { ClientService } from '../../client/client.service';
import { Group } from '../../dao/group';
import { DAOService } from '../../dao/dao.service';
import { TranslateService } from '@ngx-translate/core';
import { WelcomePage } from '../welcome/welcome.component';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { CallNumber } from '@ionic-native/call-number';
import { Sim } from '@ionic-native/sim';

@Component({
  selector: 'page-home',
  providers: [ClientService, DAOService],
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  /** the group we are working with */
  public group: Group;
  lastLocation: string;
  picture: string;

  constructor(private alertCtrl: AlertController,
    private service: ClientService,
    private callNumber: CallNumber,
    private dao: DAOService,
    public platform: Platform,
    public navCtrl: NavController, public navParams: NavParams,
    private backgroundGeolocation: BackgroundGeolocation,
    private toastCtrl: ToastController,
    private camera: Camera,
    private sim: Sim,
    private translate: TranslateService) {
    //retrieving the group from params
    this.group = this.navParams.data;
  }

  ngOnInit(): void {
    this.initialize();
  }

  /**
   * @name initialize
   * @description initialize the home component
   */
  private async initialize() {
    console.log("initializing");
    try {
      this.dao.getPhoneNumber().then((phoneNumber) => {
        console.log("phone number from database:" + phoneNumber);
        if (!phoneNumber || phoneNumber == null || phoneNumber.length == 0) {
          this.sim.requestReadPermission().then(
            () => {
              this.sim.getSimInfo().then(
                (info) => {
                  console.log("permission granted:" + info.phoneNumber);
                  console.log("asking phone number");
                  this.askPhoneNumber(info.phoneNumber);
                }
              )
            },
            () => {
              this.askPhoneNumber('');
              console.log('Permission denied');
            }
          );

        } else {
          console.log("setting phone number " + phoneNumber);
          this.service.setPhoneNumber(phoneNumber);
          if (this.platform.is('cordova')) {
            this.startGeolocation();
          }
        }

      });
    } catch (error) {
      console.log("error??:" + error);
    }
  }

  /**
   * @name startGeolocation
   * @description start the geolocation service in background
   */
  private startGeolocation() {
    const HIGH_ACCURACY = 10;
    const config: BackgroundGeolocationConfig = {
      desiredAccuracy: HIGH_ACCURACY,
      stationaryRadius: 0,
      distanceFilter: 0,
      debug: true, //  enable this hear sounds for background-geolocation life-cycle.
      stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      notificationTitle: 'Background tracking',
      notificationText: 'enabled',
      interval: 10000,
      fastestInterval: 5000,
      activitiesInterval: 10000,
    };

    this.backgroundGeolocation.configure(config)
      .subscribe((location: BackgroundGeolocationResponse) => {

        let toast = this.toastCtrl.create({
          message: 'track:' + location,
          duration: 3000
        });
        toast.present();

        this.lastLocation = "" + location.longitude + "," + location.latitude + "," + location.altitude;
        this.service.postServerData(this.group.apiurl, this.group, this.lastLocation);
        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
        // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        this.backgroundGeolocation.finish(); // FOR IOS ONLY

      });

    // start recording location
    this.backgroundGeolocation.start();
  }

  /**
   * @name sendTest
   * @description send some test info to the server
   */
  public sendTest() {
    this.service.postServerData(this.group.apiurl, this.group, "5.915952,37.162095,1234123423");
    this.service.postServerData(this.group.apiurl, this.group, "-5.918573,37.171531,2938472938");
    this.service.postServerData(this.group.apiurl, this.group, "-5.934286,37.168359,2938472938");
    this.service.postServerData(this.group.apiurl, this.group, "-5.928202,37.163811,2938472938");
    this.service.postServerData(this.group.apiurl, this.group, "-5.936432,37.156028,2938472938");
  }

  /**
   * @name sendComment
   * @description send a comment georeferenced to the server
   */
  public sendComment() {
    let commentsPrompt = this.alertCtrl.create({
      title: this.translate.instant('HOME.DIALOG.COMMENTS.TITLE'),
      subTitle: this.translate.instant('HOME.DIALOG.COMMENTS.SUBTITLE'),
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'comments',
          placeholder: this.translate.instant('HOME.DIALOG.COMMENTS.PLACEHOLDER'),
          value: ''
        }
      ],
      buttons: [
        {
          text: this.translate.instant('HOME.DIALOG.PHOTO.COMMENTS.OK'),
          handler: data => {
            this.service.postComment(this.group.apiurl, this.group, data.comments);
          }
        }
      ]
    });
    commentsPrompt.present();
  }

  /**
   * @name sendPicture
   * @description send a picture georeferenced to the server
   */
  public sendPicture() {
    const options: CameraOptions = {
      quality: 90,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: true,
      targetWidth: 400,
      targetHeight: 400,
      correctOrientation: true
    }

    this.camera.getPicture(options).then((imageData) => {
      //console.log("1.  imagedata:" + imageData);
      //1.  imagedata:file:///storage/emulated/0/Android/data/io.ionic.starter/cache/1539688551690.jpg


      let commentsPrompt = this.alertCtrl.create({
        title: this.translate.instant('HOME.DIALOG.COMMENTS.TITLE'),
        subTitle: this.translate.instant('HOME.DIALOG.COMMENTS.SUBTITLE'),
        enableBackdropDismiss: false,
        inputs: [
          {
            name: 'comments',
            placeholder: this.translate.instant('HOME.DIALOG.COMMENTS.PLACEHOLDER'),
            value: ''
          }
        ],
        buttons: [
          {
            text: this.translate.instant('HOME.DIALOG.COMMENTS.OK'),
            handler: data => {
              this.service.postPicture(this.group.apiurl, this.group, imageData, data.comments);
            }
          }
        ]
      });
      commentsPrompt.present();
    }, (err) => {
      // Handle error
    });
  }

  /**
   * @name stopTracking
   * @description stop tracking positions from the device 
   */
  public stopTracking() {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('HOME.EXIT.TITLE'),
      message: this.translate.instant('HOME.EXIT.DESCRIPTION'),
      buttons: [
        {
          text: this.translate.instant('HOME.EXIT.CANCEL'),
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: this.translate.instant('HOME.EXIT.EXIT'),
          handler: () => {
            // If you wish to turn OFF background-tracking, call the #stop method.
            this.backgroundGeolocation.stop();
            this.service.reset();
            //removing the old group reference
            this.dao.deleteGroup();

            this.navCtrl.push(WelcomePage).then(() => {
              this.navCtrl.remove(0);
            });
          }
        }
      ]
    });
    alert.present();

  }

  /**
   * @name askPhoneNumber
   * @description ask to the user its phone number
   */
  askPhoneNumber(phoneNumber) {
    let alert = this.alertCtrl.create({
      title: this.translate.instant('HOME.DIALOG.PHONENUMBER.TITLE'),
      subTitle: this.translate.instant('HOME.DIALOG.PHONENUMBER.SUBTITLE'),
      enableBackdropDismiss: false,
      inputs: [
        {
          name: 'phoneNumber',
          placeholder: this.translate.instant('HOME.DIALOG.PHONENUMBER.PLACEHOLDER'),
          type: 'tel',
          value: phoneNumber
        }
      ],
      buttons: [
        {
          text: this.translate.instant('HOME.DIALOG.PHONENUMBER.CANCEL'),
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: this.translate.instant('HOME.DIALOG.PHONENUMBER.OK'),
          handler: data => {
            if (data.phoneNumber.length == 0) {
              return false; //!not valid
            }
            this.dao.savePhoneNumber(data.phoneNumber);
            this.service.setPhoneNumber(data.phoneNumber);
            if (this.platform.is('cordova')) {
              this.startGeolocation();
            }
          }
        }
      ]
    });
    alert.present();
  }


  /**
   * @name callBase
   * @description call the contact phone for the group
   */
  callBase() {
    this.callNumber.callNumber(this.group.contactPhone, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

}
