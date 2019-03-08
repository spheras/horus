import { Component, OnInit } from '@angular/core';
import { ModalController, NavController, LoadingController, ToastController, Toast, Platform } from 'ionic-angular';
import { HomePage } from '../home/home.component';
import { DAOService } from '../../dao/dao.service';
import { Group } from '../../dao/group';
import { SplashScreen } from '@ionic-native/splash-screen';
import { TranslateService } from '@ngx-translate/core';

@Component({
    templateUrl: 'welcome.html',
    providers: [DAOService]
})
export class WelcomePage implements OnInit {

    flagCameraActive: boolean = false;

    constructor(private splashScreen: SplashScreen,
        public navCtrl: NavController,
        private modalController: ModalController,
        private dao: DAOService,
        private toastCtrl: ToastController,
        public loadingCtrl: LoadingController,
        private translate: TranslateService, private platform: Platform) {
    }

    ngOnInit(): void {
        this.splashScreen.hide();
        this.loadGroup();
    }

    /**
     * @name loadGroup
     * @description load the group info from database
     */
    async loadGroup() {
        let self = this;
        this.translate.get('DIALOG.WAIT').subscribe(async function (text: string) {
            const loader = self.loadingCtrl.create({
                content: text
            });
            loader.present();

            try {
                let group = await self.dao.getGroup();
                if (group != null) {
                    //we have a group saved, lets use it
                    self.navCtrl.push(HomePage, group).then(() => {
                        self.navCtrl.remove(0);
                    });
                }
            } catch (error) {
                self.toast(error);
            }

            loader.dismiss();
        });
    }

    private toast(message: string) {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 10000
        });
        toast.present();
    }

    /**
     * @name scanOnclick
     * @description event button clicked to start scan
     */
    scanOnclick() {
        if (this.platform.is('cordova')) {
            this.flagCameraActive = true;
            let modal = this.modalController.create('ScanQrPage');
            modal.present();
            modal.onDidDismiss((group: Group) => {
                this.flagCameraActive = false;

                if (group != null) {
                    const loader = this.loadingCtrl.create({
                        content: this.translate.instant('DIALOG.WAIT')
                    });
                    loader.present();

                    this.dao.saveGroup(group);
                    this.dao.savePhoneNumber('');
                    this.navCtrl.push(HomePage, group).then(() => {
                        this.navCtrl.remove(0);
                    });

                    loader.dismiss();
                }
            });
        } else {
            let testGroup = new Group();
            testGroup.name = "prueba";
            testGroup.hpassword = "12345";
            testGroup.sid = 1;
            testGroup.contactPhone = "1234234";
            testGroup.apiurl = "https://192.168.100.9:8443/track";
            testGroup.active = true
            this.navCtrl.push(HomePage, testGroup).then(() => {
                this.navCtrl.remove(0);
            });
        }
    }

}
