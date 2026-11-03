import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter, Subscription } from 'rxjs';

const DEFAULT_TITLE = 'סמן | מסמנים את העסק שלך במפה';
const DEFAULT_DESCRIPTION = 'עמוד אינטרנט אישי, פשוט ומקצועי לכל עסק קטן ולעצמאי.';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent implements OnDestroy {
  private readonly navigationSubscription: Subscription;
  constructor(router: Router, private title: Title, private meta: Meta) {
    this.navigationSubscription = router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
      icon.href = '/favicon.svg';

      // עמוד עסק מגדיר בעצמו כותרת, תיאור והנחיות לרובוטים. בכל עמוד אחר מחזירים ברירות מחדל,
      // כדי שהכותרת של עסק לא "תידבק" לדף הבית, ושמסך הניהול לא יתאנדקס.
      const path = (event as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0];
      if (path.startsWith('/biz/')) return;
      const isAdmin = path.startsWith('/admin');
      this.title.setTitle(isAdmin ? 'ניהול | סמן' : DEFAULT_TITLE);
      this.meta.updateTag({ name: 'description', content: DEFAULT_DESCRIPTION });
      this.meta.updateTag({ name: 'robots', content: isAdmin ? 'noindex,nofollow' : 'index,follow' });
    });
  }
  ngOnDestroy(): void { this.navigationSubscription.unsubscribe(); }
}
