import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent implements OnDestroy {
  private readonly navigationSubscription: Subscription;
  constructor(router: Router) {
    this.navigationSubscription = router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
      icon.href = '/favicon.svg';
    });
  }
  ngOnDestroy(): void { this.navigationSubscription.unsubscribe(); }
}
