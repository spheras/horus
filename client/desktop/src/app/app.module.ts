import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { routingModule } from './app.routing';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HttpModule } from '@angular/http';
import { LoginComponent } from './login/login.component';
import { JwtInterceptor } from './login/jwt.interceptor';
import { ErrorInterceptor } from './login/error.interceptor';
import { AuthGuard } from './login/auth.guard';
import { AuthenticationService } from './login/authentication.service';
import { CustomMaterialModule } from './material.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SearchesComponent } from './home/body/searches/searches.component';
import { BaseLayersComponent } from './home/body/baselayers/baselayers.component';
import { NavBarComponent } from './home/navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { BodyHeadComponent } from './home/body/bodyhead/bodyhead.component';
import { UsersComponent } from './home/body/users/users.component';
import { RowActionsComponent } from './home/body/rowactions/rowactions.component';
import { QuestionDialog } from './dialogs/question/question.component';
import { EditUserComponent } from './home/body/users/edit/edituser.component';
import { EditSearchComponent } from './home/body/searches/edit/editsearch.component';
import { GroupSectionComponent } from './home/body/searches/edit/groupsection/groupsection.component';
import { AreaSectionComponent } from './home/body/searches/edit/areasection/areasection.component';
import { LinkSectionComponent } from './home/body/searches/edit/linksection/linksection.component';
import { LocalizedDatePipe } from './utils/localizeddate';
import { NgxQRCodeModule } from 'ngx-qrcode2';



import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';

// importar locales
import localeEn from '@angular/common/locales/en';
import localeEs from '@angular/common/locales/es';
import { MapComponent } from './home/body/map/map.component';
import { QRComponent } from './qrcode/qrcode.component';
import { SettingsComponent } from './home/body/settings/settings.component';
import { EditBaseLayerComponent } from './home/body/baselayers/edit/editbaselayer.component';
import { TracksComponent } from './home/body/map/tracks/tracks.component';

// registrar los locales con el nombre que quieras utilizar a la hora de proveer
registerLocaleData(localeEn, 'en')
registerLocaleData(localeEs, 'es');

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SearchesComponent,
    BaseLayersComponent,
    UsersComponent,
    NavBarComponent,
    HomeComponent,
    BodyHeadComponent,
    RowActionsComponent,
    QuestionDialog,
    EditUserComponent,
    EditBaseLayerComponent,
    EditSearchComponent,
    GroupSectionComponent,
    AreaSectionComponent,
    LinkSectionComponent,
    TracksComponent,
    QRComponent,
    LocalizedDatePipe,
    MapComponent,
    SettingsComponent
  ],
  entryComponents: [
    QuestionDialog,
    EditUserComponent,
    EditSearchComponent,
    EditBaseLayerComponent,
    TracksComponent
  ],
  imports: [
    ReactiveFormsModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpModule,
    HttpClientModule,
    routingModule,
    FormsModule,
    NgxQRCodeModule,
    CustomMaterialModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    { provide: LOCALE_ID, useValue: 'es' },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },],
  bootstrap: [AppComponent]
})
export class AppModule { }
