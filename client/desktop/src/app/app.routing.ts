import { RouterModule, Routes } from '@angular/router';
import { ModuleWithProviders } from "@angular/core";
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './login/auth.guard';
import { QRComponent } from './qrcode/qrcode.component';

const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'qrcode/:sid', component: QRComponent, canActivate: [AuthGuard] },
    //{ path: 'search', component: SearchComponent },
    //    { path: "product/:id", component: ProductDetailComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' }
];


export const routingModule: ModuleWithProviders = RouterModule.forRoot(routes);
