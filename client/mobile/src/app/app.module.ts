import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { QRScanner } from '@ionic-native/qr-scanner';
import { Sim } from '@ionic-native/sim'
import { NativeStorage } from '@ionic-native/native-storage';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpModule } from '@angular/http';
import { MyApp } from './app.component';
import { HomePage } from './pages/home/home.component';
import { WelcomePage } from './pages/welcome/welcome.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Camera } from '@ionic-native/camera';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';
import { CallNumber } from '@ionic-native/call-number';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    WelcomePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    WelcomePage
  ],
  providers: [
    QRScanner,
    StatusBar,
    SplashScreen,
    BackgroundGeolocation,
    NativeStorage,
    FileTransfer,
    UniqueDeviceID,
    CallNumber,
    File,
    Camera,
    Sim,
    { provide: ErrorHandler, useClass: IonicErrorHandler }
  ]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}