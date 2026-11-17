import { Component } from '@angular/core';
import { I18nService } from '../services/i18n.service';

/** מתג עברית/אנגלית. הכיתוב מראה את השפה שאליה עוברים. */
@Component({
  standalone: true,
  selector: 'app-lang-switch',
  template: `<button type="button" class="lang-switch" (click)="i18n.toggle()" [attr.aria-label]="i18n.t('switchLabel')" [attr.lang]="i18n.isEnglish ? 'he' : 'en'">{{i18n.t('switchToShort')}}</button>`
})
export class LangSwitchComponent {
  constructor(public i18n: I18nService) {}
}
