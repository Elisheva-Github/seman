import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Business } from '../../models/business.model';
import { Neighborhood } from '../../models/neighborhood.model';
import { BusinessService } from '../../services/business.service';
import { NeighborhoodService } from '../../services/neighborhood.service';
import { I18nService } from '../../services/i18n.service';
import { LangSwitchComponent } from '../../shared/lang-switch.component';
import { initialOf, themeFor } from '../../shared/theme';

/** דף שכונה: כל העסקים של השכונה בריבועים קטנים, עם סינון לפי קטגוריה. */
@Component({
  standalone: true,
  imports: [RouterLink, LangSwitchComponent],
  selector: 'app-neighborhood',
  template: `
  @if (neighborhood) {
    <div class="bz nb">
      <a class="skip-link" href="#main-content" (click)="skipToContent($event)">{{i18n.t('skipToContent')}}</a>
      <header class="bz-header">
        <div class="bz-header-inner">
          <a class="bz-name" href="#top" dir="auto" (click)="scrollToTop($event)">{{neighborhood.name}}</a>
          <span class="bz-spacer"></span>
          <a class="bz-seman-link" routerLink="/">{{i18n.t('semanSite')}}</a>
          <app-lang-switch />
        </div>
      </header>

      <main id="main-content" tabindex="-1">
        <section id="top" class="bz-hero nb-hero">
          <svg class="bz-hero-deco" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <g fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2">
              <circle cx="90" cy="70" r="46"/><circle cx="90" cy="70" r="86"/><circle cx="90" cy="70" r="130"/>
              <circle cx="720" cy="300" r="60"/><circle cx="720" cy="300" r="110"/><circle cx="720" cy="300" r="165"/>
              <path d="M0 250 C 160 200, 260 330, 420 270 S 700 180, 800 230" stroke-dasharray="3 9"/>
            </g>
          </svg>
          <div class="bz-hero-content">
            @if (neighborhood.logoUrl) { <div class="bz-logo"><img [src]="neighborhood.logoUrl" [alt]="i18n.t('nbLogoOf', {name: neighborhood.name})"></div> }
            @else { <div class="bz-logo bz-logo-initial" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg></div> }
            <h1 dir="auto">{{neighborhood.name}}</h1>
            <p class="bz-hours" dir="auto">{{neighborhood.description || i18n.t('nbWelcome')}}</p>
            @if (!loadingBusinesses) { <span class="bz-chip nb-count">{{countLabel}}</span> }
          </div>
        </section>

        <div class="bz-wrap">
          @if (categories.length > 1) {
            <section class="bz-card nb-filters" [attr.aria-label]="i18n.t('nbFilterLabel')">
              <div class="nb-chips" role="group" [attr.aria-label]="i18n.t('nbFilterLabel')">
                <button type="button" class="nb-chip" [attr.aria-pressed]="!selected" (click)="select('')">{{i18n.t('nbAll')}}</button>
                @for (category of categories; track category) {
                  <button type="button" class="nb-chip" dir="auto" [attr.aria-pressed]="selected === category" (click)="select(category)">{{category}}</button>
                }
              </div>
            </section>
          }

          @if (loadingBusinesses) { <p class="nb-message" role="status">{{i18n.t('loading')}}</p> }
          @else if (!businesses.length) { <p class="nb-message">{{i18n.t('nbEmpty')}}</p> }
          @else if (!visible.length) { <p class="nb-message">{{i18n.t('nbEmptyCategory')}}</p> }

          <div class="nb-grid">
            @for (business of visible; track business.id) {
              <a class="nb-tile" [routerLink]="['/biz', business.slug]" [style.--bz-a]="themeOf(business).a" [style.--bz-ad]="themeOf(business).ad" [style.--bz-t]="themeOf(business).t">
                <span class="nb-tile-media">
                  @if (business.logoUrl) { <img [src]="business.logoUrl" [alt]="i18n.t('logoOf', {name: business.name})" loading="lazy"> }
                  @else if (business.imageUrl) { <img class="nb-cover" [src]="business.imageUrl" [alt]="i18n.t('photoOf', {name: business.name})" loading="lazy"> }
                  @else { <span class="nb-initial" aria-hidden="true">{{initialOf(business.name)}}</span> }
                </span>
                <span class="nb-tile-body">
                  @if (business.category) { <span class="nb-tile-cat" dir="auto">{{business.category}}</span> }
                  <strong class="nb-tile-name" dir="auto">{{business.name}}</strong>
                  @if (business.address) { <span class="nb-tile-addr" dir="auto">{{business.address}}</span> }
                  <span class="nb-tile-go">{{i18n.t('nbToBusiness')}}</span>
                </span>
              </a>
            }
          </div>

          <section class="bz-card nb-semancta">
            <a class="button outline" routerLink="/">{{i18n.t('nbSemanLink')}}</a>
          </section>
        </div>

        <footer class="business-brand-footer bz-footer">
          <a class="brand" routerLink="/"><span class="pin-mark"></span> סמן</a>
          <p>{{i18n.t('poweredFull')}}</p>
          <a class="bz-footer-link small" routerLink="/accessibility">{{i18n.t('a11yStatement')}}</a>
        </footer>
      </main>
    </div>
  } @else if (loading) {
    <main class="not-found" id="main-content"><p>{{i18n.t('nbLoading')}}</p></main>
  } @else {
    <main class="not-found" id="main-content"><h1>{{i18n.t('nbNotFoundTitle')}}</h1><p>{{i18n.t('nbNotFoundText')}}</p><a class="button" routerLink="/">{{i18n.t('backToSeman')}}</a></main>
  }
  `
})
export class NeighborhoodComponent implements OnInit {
  neighborhood?: Neighborhood;
  businesses: Business[] = [];
  categories: string[] = [];
  selected = '';
  loading = true;
  loadingBusinesses = true;

  constructor(
    private route: ActivatedRoute,
    private neighborhoods: NeighborhoodService,
    private businessService: BusinessService,
    private title: Title,
    private meta: Meta,
    public i18n: I18nService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      this.loading = true; this.loadingBusinesses = true; this.selected = '';
      try {
        this.neighborhood = await this.neighborhoods.getBySlug(params.get('slug') ?? '');
        if (this.neighborhood) {
          this.title.setTitle(`${this.neighborhood.name} | סמן`);
          this.meta.updateTag({ name: 'description', content: (this.neighborhood.description || `${this.neighborhood.name} – ${this.i18n.t('nbWelcome')}`).slice(0, 155) });
          this.meta.updateTag({ name: 'robots', content: 'index,follow' });
          this.applySeo(this.neighborhood);
          try {
            this.businesses = await this.businessService.getByNeighborhood(this.neighborhood.id);
          } catch { this.businesses = []; }
          this.categories = Array.from(new Set(this.businesses.map(b => (b.category || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'he'));
        }
      } catch { this.neighborhood = undefined; this.businesses = []; this.categories = []; }
      finally {
        if (!this.neighborhood) {
          this.title.setTitle('השכונה לא נמצאה | סמן');
          this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
        }
        this.loading = false; this.loadingBusinesses = false;
      }
    });
  }

  /** קידום בגוגל: canonical ו-Open Graph */
  private applySeo(n: Neighborhood): void {
    const url = `${this.doc.location?.origin || ''}/n/${encodeURIComponent(n.slug)}`;
    let canonical = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = this.doc.createElement('link'); canonical.rel = 'canonical'; this.doc.head.appendChild(canonical); }
    canonical.href = url;
    this.meta.updateTag({ property: 'og:title', content: `${n.name} | סמן` });
    this.meta.updateTag({ property: 'og:description', content: (n.description || `${n.name} – ${this.i18n.t('nbWelcome')}`).slice(0, 155) });
    this.meta.updateTag({ property: 'og:url', content: url });
    if (n.logoUrl) this.meta.updateTag({ property: 'og:image', content: n.logoUrl });
  }

  get visible(): Business[] {
    return this.selected ? this.businesses.filter(b => (b.category || '').trim() === this.selected) : this.businesses;
  }

  get countLabel(): string {
    const n = this.businesses.length;
    return n === 1 ? this.i18n.t('nbBusinessesCountOne') : this.i18n.t('nbBusinessesCount', { n });
  }

  select(category: string): void { this.selected = category; }
  themeOf(business: Business) { return themeFor(business.slug); }
  initialOf(name: string): string { return initialOf(name); }

  private get scrollBehavior(): ScrollBehavior {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-nomotion');
    return reduce ? 'auto' : 'smooth';
  }
  scrollToTop(event: Event): void { event.preventDefault(); window.scrollTo({ top: 0, behavior: this.scrollBehavior }); }
  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
}
