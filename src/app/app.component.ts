import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter, Subscription } from 'rxjs';
import { I18nService } from './services/i18n.service';
import { A11yWidgetComponent } from './shared/a11y-widget.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, A11yWidgetComponent],
  template: '<router-outlet /><app-a11y-widget />'
})
export class AppComponent implements OnDestroy {
  private readonly navigationSubscription: Subscription;
  private path = '';

  constructor(router: Router, private title: Title, private meta: Meta, private i18n: I18nService) {
    this.navigationSubscription = router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
      if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
      icon.href = '/favicon.svg';
      this.path = (event as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0];
      this.applyDefaults();
    });
    // בהחלפת שפה מעדכנים את כותרת ברירת המחדל של העמודים הכלליים
    this.i18n.onChange(() => this.applyDefaults());
  }

  /** עמוד עסק/שכונה מגדירים בעצמם כותרת ותיאור. בכל עמוד אחר מחזירים ברירות מחדל,
   *  כדי שהכותרת של עסק לא "תידבק" לדף הבית, ושמסך הניהול לא יתאנדקס. */
  private applyDefaults(): void {
    if (this.path.startsWith('/biz/') || this.path.startsWith('/n/')) return;
    const isAdmin = this.path.startsWith('/admin');
    const isStatement = this.path.startsWith('/accessibility');
    this.title.setTitle(isAdmin ? 'ניהול | סמן' : isStatement ? `${this.i18n.t('a11yStatementTitle')} | סמן` : this.i18n.t('siteTitle'));
    this.meta.updateTag({ name: 'description', content: this.i18n.t('siteDescription') });
    this.meta.updateTag({ name: 'robots', content: isAdmin ? 'noindex,nofollow' : 'index,follow' });
  }

  ngOnDestroy(): void { this.navigationSubscription.unsubscribe(); }
}
