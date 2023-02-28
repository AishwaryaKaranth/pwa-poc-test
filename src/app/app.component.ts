import { Component, HostListener, OnInit } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { filter, map } from 'rxjs/operators';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'pwa-test-1';
  //promptEvent: any;
  isOnline!: boolean;
  modalVersion!: boolean;
  modalPwaEvent: any;
  modalPwaPlatform: string | undefined;

  constructor(private platform: Platform,
    private swUpdate: SwUpdate) {
    this.isOnline = false;
    this.modalVersion = false;
  }

  ngOnInit(): void {
    this.updateOnlineStatus();

    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offine', this.updateOnlineStatus.bind(this));

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt: any): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        map((evt: any) => {
          console.info(`currentVersion=[${evt.currentVersion} | latestVersion=[${evt.latestVersion}]`);
          this.modalVersion = true;
        }),
      );
    }

    this.loadModalPwa();
  }

  private updateOnlineStatus() {
    this.isOnline = window.navigator.onLine;
    console.info(`isOnline=[${this.isOnline}]`);
  }

  updateVersion() {
    this.modalVersion = false;
    window.location.reload();
  }

  closeVersion() {
    this.modalVersion = false;
  }

  private loadModalPwa() {
    if (this.platform.ANDROID) {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.modalPwaEvent = event;
        this.modalPwaPlatform = 'ANDROID';
      })
    }

    if (this.platform.IOS && this.platform.SAFARI) {
      const isStandaloneMode = ('standalone' in window.navigator) && ((<any>window.navigator)['standalone']);

      if (!isStandaloneMode) {
        this.modalPwaPlatform = 'IOS';
      }
    }

  }

  addToHomeScreen() {
    this.modalPwaEvent.prompt();
    this.modalPwaPlatform = undefined;
  }

  closePwa() {
    this.modalPwaPlatform = undefined;
  }


  // @HostListener('window:beforeinstallprompt', ['$event']) onbeforeinstallprompt(e: { preventDefault: () => void; }) {
  //   e.preventDefault();
  //   this.promptEvent = e;
  // }

  // installPWA() {
  //   this.promptEvent.prompt();
  // }

  // isRunningStandAlone() {
  //   return (window.matchMedia('(display-mode:standalone)').matches);
  // }

  // shouldInstall() {
  //   return !this.isRunningStandAlone() && this.promptEvent;
  // }


}
