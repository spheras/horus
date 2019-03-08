import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { AuthenticationService } from '../../login/authentication.service';
import { Router } from '@angular/router';
import { MatSidenav, MatMenuTrigger } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { MapComponent } from '../body/map/map.component';

@Component({
    selector: 'navbar',
    providers: [AuthenticationService],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavBarComponent {
    @Input() sideNav: MatSidenav;
    @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

    //the map component to comunicate with
    public map: MapComponent;
    flagFullScreen: boolean = this.isFullScreen();
    
    //the selected menu
    @Input() selected: string;

    constructor(private translate: TranslateService, private router: Router, private authService: AuthenticationService) { }

    /**
     * Show/hide SideNave
     */
    showHideSideNav() {
        this.sideNav.toggle();
    }

    /**
     * logout.. the user must login again
     */
    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    /**
     * Show flags menu to change language
     */
    showFlags() {
        this.trigger.openMenu();
    }

    /**
     * Change the language
     * @param {string} lang  the new language
     */
    changeLang(lang) {
        this.translate.use(lang);
    }



    fullscreen() {
        this.toggleFullScreen();
        this.flagFullScreen = !this.flagFullScreen;
    }


    toggleFullScreen(): void {
        const fsDoc = <FsDocument>document;

        if (!this.isFullScreen()) {
            const fsDocElem = <FsDocumentElement>document.documentElement;

            if (fsDocElem.requestFullscreen)
                fsDocElem.requestFullscreen();
            else if (fsDocElem.msRequestFullscreen)
                fsDocElem.msRequestFullscreen();
            else if (fsDocElem.mozRequestFullScreen)
                fsDocElem.mozRequestFullScreen();
            else if (fsDocElem.webkitRequestFullscreen)
                fsDocElem.webkitRequestFullscreen();
        }
        else if (fsDoc.exitFullscreen)
            fsDoc.exitFullscreen();
        else if (fsDoc.msExitFullscreen)
            fsDoc.msExitFullscreen();
        else if (fsDoc.mozCancelFullScreen)
            fsDoc.mozCancelFullScreen();
        else if (fsDoc.webkitExitFullscreen)
            fsDoc.webkitExitFullscreen();
    }

    setFullScreen(full: boolean): void {
        if (full !== this.isFullScreen())
            this.toggleFullScreen();
    }

    isFullScreen(): boolean {
        const fsDoc = <FsDocument>document;

        return !!(fsDoc.fullscreenElement || fsDoc.mozFullScreenElement || fsDoc.webkitFullscreenElement || fsDoc.msFullscreenElement);
    }

}


interface FsDocument extends HTMLDocument {
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    msExitFullscreen?: () => void;
    mozCancelFullScreen?: () => void;
}



interface FsDocumentElement extends HTMLElement {
    msRequestFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
}
