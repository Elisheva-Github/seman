import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../services/i18n.service';

interface A11yState { zoom: 0 | 1 | 2 | 3; contrast: boolean; gray: boolean; links: boolean; font: boolean; motion: boolean; }
const KEY = 'seman-a11y';
const DEFAULTS: A11yState = { zoom: 0, contrast: false, gray: false, links: false, font: false, motion: false };

/**
 * כפתור נגישות צף + תפריט: גודל טקסט, ניגודיות, גווני אפור, הדגשת קישורים,
 * גופן קריא והפסקת אנימציות. ההגדרות נשמרות בדפדפן וחלות על כל העמודים.
 */
@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-a11y-widget',
  template: `
    <button class="a11y-fab" type="button" (click)="toggle()" [attr.aria-expanded]="open" aria-controls="a11y-panel" [attr.aria-label]="i18n.t('a11yButton')" [title]="i18n.t('a11yButton')">
      <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><circle cx="12" cy="4.2" r="2.2" fill="currentColor"/><path d="M5 8.5h14M12 8.5v6M12 14.5l-3.6 6M12 14.5l3.6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" fill="none"/></svg>
    </button>
    @if (open) {
      <div class="a11y-panel" id="a11y-panel" role="dialog" [attr.aria-label]="i18n.t('a11yTitle')" (keydown.escape)="close()">
        <div class="a11y-head">
          <strong>{{i18n.t('a11yTitle')}}</strong>
          <button type="button" class="a11y-close" (click)="close()" [attr.aria-label]="i18n.t('a11yClose')">✕</button>
        </div>
        <div class="a11y-size" role="group" [attr.aria-label]="i18n.t('a11yTextSize')">
          <span>{{i18n.t('a11yTextSize')}}</span>
          <button type="button" (click)="zoomBy(-1)" [disabled]="state.zoom === 0" [attr.aria-label]="i18n.t('a11ySmaller')">A−</button>
          <button type="button" (click)="zoomBy(1)" [disabled]="state.zoom === 3" [attr.aria-label]="i18n.t('a11yBigger')">A+</button>
        </div>
        <button type="button" class="a11y-option" [attr.aria-pressed]="state.contrast" (click)="flip('contrast')">{{i18n.t('a11yContrast')}}</button>
        <button type="button" class="a11y-option" [attr.aria-pressed]="state.gray" (click)="flip('gray')">{{i18n.t('a11yGrayscale')}}</button>
        <button type="button" class="a11y-option" [attr.aria-pressed]="state.links" (click)="flip('links')">{{i18n.t('a11yLinks')}}</button>
        <button type="button" class="a11y-option" [attr.aria-pressed]="state.font" (click)="flip('font')">{{i18n.t('a11yFont')}}</button>
        <button type="button" class="a11y-option" [attr.aria-pressed]="state.motion" (click)="flip('motion')">{{i18n.t('a11yMotion')}}</button>
        <div class="a11y-foot">
          <button type="button" class="a11y-reset" (click)="reset()">{{i18n.t('a11yReset')}}</button>
          <a routerLink="/accessibility" (click)="close()">{{i18n.t('a11yStatement')}}</a>
        </div>
      </div>
    }
  `
})
export class A11yWidgetComponent {
  open = false;
  state: A11yState = { ...DEFAULTS };

  constructor(public i18n: I18nService) {
    try { this.state = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { /* ברירת מחדל */ }
    if (![0, 1, 2, 3].includes(this.state.zoom)) this.state.zoom = 0;
    this.apply();
  }

  toggle(): void { this.open = !this.open; }
  close(): void { this.open = false; }

  zoomBy(step: number): void {
    this.state = { ...this.state, zoom: Math.min(3, Math.max(0, this.state.zoom + step)) as A11yState['zoom'] };
    this.save();
  }

  flip(key: 'contrast' | 'gray' | 'links' | 'font' | 'motion'): void {
    this.state = { ...this.state, [key]: !this.state[key] };
    this.save();
  }

  reset(): void { this.state = { ...DEFAULTS }; this.save(); }

  private save(): void {
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch { /* לא קריטי */ }
    this.apply();
  }

  private apply(): void {
    const root = document.documentElement;
    root.classList.remove('a11y-zoom-1', 'a11y-zoom-2', 'a11y-zoom-3');
    if (this.state.zoom) root.classList.add(`a11y-zoom-${this.state.zoom}`);
    root.classList.toggle('a11y-contrast', this.state.contrast);
    root.classList.toggle('a11y-gray', this.state.gray);
    root.classList.toggle('a11y-links', this.state.links);
    root.classList.toggle('a11y-font', this.state.font);
    root.classList.toggle('a11y-nomotion', this.state.motion);
  }
}
