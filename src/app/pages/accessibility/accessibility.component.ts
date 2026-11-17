import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../services/i18n.service';
import { SiteContentService } from '../../services/site-content.service';
import { LangSwitchComponent } from '../../shared/lang-switch.component';

@Component({
  standalone: true,
  imports: [RouterLink, LangSwitchComponent],
  selector: 'app-accessibility',
  template: `
    <header class="bz-header">
      <div class="bz-header-inner">
        <a class="bz-name" routerLink="/">{{i18n.t('semanSite')}}</a>
        <span class="bz-spacer"></span>
        <app-lang-switch />
      </div>
    </header>
    <main class="a11y-statement" id="main-content" tabindex="-1">
      <h1>{{i18n.t('a11yStatementTitle')}}</h1>
      <p>{{i18n.t('a11yStatementBody1')}}</p>
      <p>{{i18n.t('a11yStatementBody2')}}</p>
      <p>{{i18n.t('a11yStatementBody3')}}</p>
      @if (site.content.contact.email) {
        <p><strong>{{i18n.t('a11yStatementContact')}}:</strong> <a [href]="'mailto:' + site.content.contact.email" dir="ltr">{{site.content.contact.email}}</a>@if (site.content.contact.phone) { · <a [href]="'tel:' + site.content.contact.phone" dir="ltr">{{site.content.contact.phone}}</a> }</p>
      }
      <p class="a11y-updated">{{i18n.t('a11yStatementUpdated')}}</p>
      <a class="button" routerLink="/">{{i18n.t('a11yBack')}}</a>
    </main>
  `
})
export class AccessibilityComponent {
  constructor(public i18n: I18nService, public site: SiteContentService) { void this.site.load(); }
}
