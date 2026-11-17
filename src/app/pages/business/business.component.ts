import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Business } from '../../models/business.model';
import { Neighborhood } from '../../models/neighborhood.model';
import { BusinessService, Recommendation } from '../../services/business.service';
import { NeighborhoodService } from '../../services/neighborhood.service';
import { I18nService } from '../../services/i18n.service';
import { environment } from '../../../environments/environment';
import { LangSwitchComponent } from '../../shared/lang-switch.component';
import { Theme, initialOf, themeFor } from '../../shared/theme';

@Component({
  standalone: true,
  imports: [RouterLink, LangSwitchComponent],
  selector: 'app-business',
  template: `
  @if (business) {
    <div class="bz" [style.--bz-a]="theme.a" [style.--bz-ad]="theme.ad" [style.--bz-t]="theme.t">
      <a class="skip-link" href="#main-content" (click)="skipToContent($event)">{{i18n.t('skipToContent')}}</a>

      <header class="bz-header">
        <div class="bz-header-inner">
          <a class="bz-name" href="#business-about" dir="auto" (click)="scrollToSection($event, 'business-about')">{{business.name}}</a>
          <nav class="bz-nav" [attr.aria-label]="i18n.t('navTopLabel')">
            <a href="#business-about" (click)="scrollToSection($event, 'business-about')">{{i18n.t('navAbout')}}</a>
            <a href="#business-contact" (click)="scrollToSection($event, 'business-contact')">{{i18n.t('navContact')}}</a>
            <a href="#business-question" (click)="scrollToSection($event, 'business-question')">{{i18n.t('navMessage')}}</a>
            @if (business.galleryUrls.length) { <a href="#business-gallery" (click)="scrollToSection($event, 'business-gallery')">{{i18n.t('navGallery')}}</a> }
            @if (recommendations.length) { <a href="#business-recommendations" (click)="scrollToSection($event, 'business-recommendations')">{{i18n.t('navReviews')}}</a> }
          </nav>
          <app-lang-switch />
        </div>
      </header>

      <main id="main-content" tabindex="-1">
        <section id="business-about" class="bz2-hero">
          <svg class="bz-hero-deco" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <g fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2">
              <circle cx="90" cy="70" r="46"/><circle cx="90" cy="70" r="86"/><circle cx="90" cy="70" r="130"/>
              <circle cx="720" cy="300" r="60"/><circle cx="720" cy="300" r="110"/><circle cx="720" cy="300" r="165"/>
              <path d="M0 250 C 160 200, 260 330, 420 270 S 700 180, 800 230" stroke-dasharray="3 9"/>
            </g>
          </svg>
          <div class="bz2-hero-grid">
            <div class="bz2-hero-text">
              @if (business.category) {
                <span class="bz-chip">
                  <svg class="bz-chip-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>
                  <span dir="auto">{{business.category}}</span>
                </span>
              }
              <h1 dir="auto">{{business.name}}</h1>
              <h2 class="bz2-sub">{{i18n.t('aboutTitle')}} – {{i18n.t('aboutWhy')}}</h2>
              @if (business.description) { <p class="bz2-about" dir="auto">{{business.description}}</p> }
              @if (business.hours) {
                <div class="bz2-hours"><span class="bz2-hours-title"><span aria-hidden="true">◷</span> {{i18n.t('hoursTitle')}}</span><span class="bz2-hours-text" dir="auto">{{business.hours}}</span></div>
              }
              @if (neighborhood) { <a class="bz-nb-link" [routerLink]="['/n', neighborhood.slug]">{{i18n.t('inNeighborhood', {name: neighborhood.name})}}</a> }
              <div class="bz2-cta">
                <a class="button bz2-btn-light" href="#business-contact" (click)="scrollToSection($event, 'business-contact')">{{i18n.t('toContactBtn')}}</a>
                <a class="button bz2-btn-ghost" href="#business-question" (click)="scrollToSection($event, 'business-question')">{{i18n.t('toMessageBtn')}}</a>
              </div>
            </div>
            <div class="bz2-hero-pic">
              <div class="bz2-circle">
                @if (business.imageUrl) { <img [src]="business.imageUrl" [alt]="i18n.t('photoOf', {name: business.name})"> }
                @else if (business.logoUrl) { <img [src]="business.logoUrl" [alt]="i18n.t('logoOf', {name: business.name})"> }
                @else { <span class="bz2-initial" aria-hidden="true">{{initial}}</span> }
              </div>
              @if (business.imageUrl && business.logoUrl) { <div class="bz2-mini-logo"><img [src]="business.logoUrl" [alt]="i18n.t('logoOf', {name: business.name})"></div> }
            </div>
          </div>
        </section>

        <section id="business-contact" class="bz2-band bz2-contact">
          <svg class="bz2-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0h1440v20C1200 62 960 62 720 30S240-6 0 28z"/></svg>
          <div class="bz2-inner">
            <div class="section-heading-center"><span class="eyebrow">{{i18n.t('contactEyebrow')}}</span><h2>{{i18n.t('contactTitle')}}</h2><p>{{i18n.t('contactSub', {name: business.name})}}</p></div>
            <div class="business-contact-tiles">
              @if (business.address) {
                <a class="business-contact-tile address-tile" [href]="mapsUrl" target="_blank" rel="noopener">
                  <span class="tile-icon">⌖</span><strong>{{i18n.t('address')}}</strong><span dir="auto">{{business.address}}</span><small>{{i18n.t('addressHint')}}</small>
                </a>
              }
              @if (business.phone) {
                <a class="business-contact-tile phone-tile" [href]="'tel:' + business.phone">
                  <span class="tile-icon">☎</span><strong>{{i18n.t('phone')}}</strong><span dir="ltr">{{business.phone}}</span><small>{{i18n.t('phoneHint')}}</small>
                </a>
              }
              @if (business.email || business.website) {
                <div class="business-contact-tile email-tile">
                  <span class="tile-icon">✉</span><strong>{{i18n.t('email')}}</strong>
                  @if (business.email) { <span class="email-copy-line" dir="ltr">{{business.email}} <button type="button" class="copy-email-button" (click)="copyEmail()" [attr.aria-label]="i18n.t('copyEmailAria')" [title]="i18n.t('copyEmailTitle')">⧉</button></span> }
                  @if (business.website) { <a class="tile-website" [href]="websiteUrl" target="_blank" rel="noopener" dir="ltr">{{business.website}}</a> }
                  @if (business.email) { <a class="tile-email-link" [href]="'mailto:' + business.email">{{i18n.t('sendEmail')}}</a> }
                </div>
              }
            </div>
            <div class="business-extra-actions">
              @if (hasWhatsApp) { <a class="button whatsapp" [href]="whatsappUrl" target="_blank" rel="noopener">{{i18n.t('whatsappSend')}}</a> }
              @else { <span class="whatsapp-unavailable">{{business.phone || business.email ? i18n.t('whatsappNone') : i18n.t('whatsappNoneShort')}}</span> }
              @if (business.phone) { <a class="button outline" [href]="smsUrl">{{i18n.t('smsSend')}}</a> }
              <button class="button outline" type="button" (click)="shareDetails()">{{i18n.t('shareBusiness')}}</button>
            </div>
          </div>
        </section>

        <section id="business-question" class="bz2-band bz2-message">
          <svg class="bz2-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0h1440v28C1180-8 960 6 720 34S240 62 0 22z"/></svg>
          <div class="bz2-inner bz2-narrow">
            <div class="question-heading"><span class="question-icon" aria-hidden="true">✉</span><h2>{{i18n.t('questionTitle')}}</h2><p>{{i18n.t('questionSub')}}</p></div>
            <form class="business-question-form bz2-form" (submit)="sendQuestion($event)">
              <label class="honeypot" aria-hidden="true">{{i18n.t('notToFill')}}<input name="company_website" tabindex="-1" autocomplete="off"></label>
              <label>{{i18n.t('fullName')}}<input required name="name" maxlength="120" autocomplete="name" [placeholder]="i18n.t('fullNamePh')"></label>
              <label>{{i18n.t('phoneLabel')}}<input name="phone" type="tel" maxlength="50" autocomplete="tel" [placeholder]="i18n.t('phonePh')"></label>
              <label>{{i18n.t('emailLabel')}}<input required name="email" type="email" maxlength="200" autocomplete="email" [placeholder]="i18n.t('emailPh')"></label>
              <label class="full-field">{{i18n.t('messageLabel')}}<textarea name="message" rows="4" maxlength="3000" [placeholder]="i18n.t('messagePh')"></textarea></label>
              <button class="button seman-submit" type="submit" [disabled]="sending">{{sending ? i18n.t('sending') : i18n.t('submit')}}</button>
              @if (formMessage) { <p class="form-feedback" [class.form-error]="formError" role="status">{{formMessage}}</p> }
              <small>{{i18n.t('bizFormNote')}}</small>
            </form>
          </div>
        </section>

        @if (business.galleryUrls.length) {
          <section id="business-gallery" class="bz2-band bz2-gallery">
            <svg class="bz2-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0h1440v22C1210 60 940 60 700 28S230-4 0 30z"/></svg>
            <div class="bz2-inner">
              <div class="section-heading-center"><h2>{{i18n.t('galleryTitle')}}</h2></div>
              <div class="gallery-grid">@for (imageUrl of business.galleryUrls; track $index) { <img [src]="imageUrl" [alt]="i18n.t('photoOf', {name: business.name})" loading="lazy"> }</div>
            </div>
          </section>
        }

        @if (recommendations.length) {
          <section id="business-recommendations" class="bz2-band bz2-reviews">
            <svg class="bz2-wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0h1440v30C1170 62 930 -4 700 26S250 58 0 20z"/></svg>
            <div class="bz2-inner">
              <div class="section-heading-center"><span class="eyebrow">{{i18n.t('reviewsEyebrow', {name: business.name})}}</span><h2>{{i18n.t('reviewsTitle')}}</h2></div>
              <div class="business-recommendations-grid">
                @for (recommendation of recommendations; track recommendation.id) {
                  <article class="feature recommendation-card"><span aria-hidden="true">★★★★★</span><p dir="auto">{{recommendation.content}}</p><strong dir="auto">{{recommendation.customerName}}</strong></article>
                }
              </div>
            </div>
          </section>
        }

        <footer class="business-brand-footer bz-footer">
          @if (neighborhood) { <a class="bz-footer-link" [routerLink]="['/n', neighborhood.slug]">{{i18n.t('moreInNeighborhood', {name: neighborhood.name})}}</a> }
          <a class="brand" routerLink="/"><span class="pin-mark"></span> סמן</a>
          <p>{{i18n.t('poweredFull')}}</p>
          <p dir="auto">{{i18n.t('copyright', {name: business.name})}}</p>
          <a class="bz-footer-link small" routerLink="/accessibility">{{i18n.t('a11yStatement')}}</a>
        </footer>
      </main>
    </div>
  } @else if (loading) {
    <main class="not-found" id="main-content"><p>{{i18n.t('loadingBusiness')}}</p></main>
  } @else {
    <main class="not-found" id="main-content"><h1>{{i18n.t('notFoundTitle')}}</h1><p>{{i18n.t('notFoundText')}}</p><a class="button" routerLink="/">{{i18n.t('backToSeman')}}</a></main>
  }
  `
})
export class BusinessComponent implements OnInit, OnDestroy {
  business?: Business;
  neighborhood?: Neighborhood;
  recommendations: Recommendation[] = [];
  theme: Theme = themeFor('seman');
  initial = '';
  loading = true;
  sending = false;
  formMessage = '';
  formError = false;

  constructor(
    private route: ActivatedRoute,
    private service: BusinessService,
    private neighborhoods: NeighborhoodService,
    private title: Title,
    private meta: Meta,
    public i18n: I18nService,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  ngOnDestroy(): void { this.doc.getElementById('seman-jsonld')?.remove(); }

  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      this.loading = true;
      this.neighborhood = undefined;
      try {
        this.business = await this.service.getBySlug(params.get('slug') ?? '');
        if (this.business) {
          this.theme = themeFor(this.business.slug);
          this.initial = initialOf(this.business.name);
          this.title.setTitle(`${this.business.name} | סמן`);
          const icon = this.ensureFaviconLink();
          icon.href = this.business.faviconUrl || '/favicon.svg';
          void this.trackVisit(this.business.id);
          void this.loadNeighborhood(this.business.neighborhoodId);
          if (this.business.showRecommendations) {
            try { this.recommendations = await this.service.getRecommendations(false, this.business.id); }
            catch { this.recommendations = []; }
          } else {
            this.recommendations = [];
          }
          this.meta.updateTag({ name: 'description', content: `${this.business.name} – ${this.business.category}. ${this.business.description}`.slice(0, 155) });
          this.meta.updateTag({ name: 'robots', content: 'index,follow' });
          this.applySeo(this.business);
        }
      } catch { this.business = undefined; this.recommendations = []; }
      finally {
        if (!this.business) {
          this.title.setTitle('העמוד לא נמצא | סמן');
          this.ensureFaviconLink().href = '/favicon.svg';
          this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
        }
        this.loading = false;
      }
    });
  }

  /** קידום בגוגל: canonical, Open Graph ונתונים מובנים (LocalBusiness) */
  private applySeo(b: Business): void {
    const origin = this.doc.location?.origin || '';
    const url = `${origin}/biz/${encodeURIComponent(b.slug)}`;
    let canonical = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = this.doc.createElement('link'); canonical.rel = 'canonical'; this.doc.head.appendChild(canonical); }
    canonical.href = url;
    const desc = `${b.name} – ${b.category}. ${b.description}`.slice(0, 155);
    this.meta.updateTag({ property: 'og:title', content: `${b.name} | סמן` });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    if (b.imageUrl || b.logoUrl) this.meta.updateTag({ property: 'og:image', content: b.imageUrl || b.logoUrl });
    const data: Record<string, unknown> = { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: b.name, url };
    if (b.description) data['description'] = b.description;
    if (b.phone) data['telephone'] = b.phone;
    if (b.email) data['email'] = b.email;
    if (b.address) data['address'] = { '@type': 'PostalAddress', streetAddress: b.address, addressCountry: 'IL' };
    if (b.imageUrl || b.logoUrl) data['image'] = b.imageUrl || b.logoUrl;
    if (b.logoUrl) data['logo'] = b.logoUrl;
    let script = this.doc.getElementById('seman-jsonld') as HTMLScriptElement | null;
    if (!script) { script = this.doc.createElement('script'); script.id = 'seman-jsonld'; script.type = 'application/ld+json'; this.doc.head.appendChild(script); }
    // מניעת סגירת תג מוקדמת בתוך טקסט שהוזן בניהול
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }

  private async loadNeighborhood(id: string): Promise<void> {
    try { this.neighborhood = await this.neighborhoods.getById(id); }
    catch { this.neighborhood = undefined; }
  }

  private get scrollBehavior(): ScrollBehavior {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('a11y-nomotion');
    return reduce ? 'auto' : 'smooth';
  }

  scrollToTop(event: Event): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: this.scrollBehavior });
  }

  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    event.stopPropagation();
    // ההיסט בגלל הכותרת הדביקה מוגדר ב-CSS (scroll-margin-top)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: this.scrollBehavior, block: 'start' });
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  private ensureFaviconLink(): HTMLLinkElement {
    let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
    return icon;
  }

  private async trackVisit(businessId: string): Promise<void> {
    try {
      await fetch(`${environment.supabaseUrl}/functions/v1/track-visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: environment.supabaseAnonKey },
        body: JSON.stringify({ businessId })
      });
    } catch { /* מדידת ביקור אינה חוסמת טעינת עמוד עסק */ }
  }

  get phoneForWhatsApp(): string { return (this.business?.whatsapp || '').replace(/\D/g, '').replace(/^0/, '972'); }
  get hasWhatsApp(): boolean { return /^\d{8,15}$/.test(this.phoneForWhatsApp); }
  get whatsappUrl(): string { return `https://wa.me/${this.phoneForWhatsApp}?text=${encodeURIComponent(this.shareText)}`; }
  get smsUrl(): string { return `sms:${this.business?.phone || ''}?body=${encodeURIComponent(this.shareText)}`; }
  get mapsUrl(): string { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.business?.address || '')}`; }
  get websiteUrl(): string { const value = this.business?.website || ''; return /^https?:\/\//i.test(value) ? value : `https://${value}`; }

  get shareText(): string {
    if (!this.business) return '';
    const t = (key: string) => this.i18n.t(key);
    return `${this.business.name}\n${this.business.category}\n${t('shareTelLabel')}: ${this.business.phone}\n${t('shareEmailLabel')}: ${this.business.email}\n${t('shareSiteLabel')}: ${this.business.website}\n${t('shareAddressLabel')}: ${this.business.address}\n${window.location.href}`;
  }

  async copyEmail(): Promise<void> {
    if (!this.business?.email) return;
    try { await navigator.clipboard.writeText(this.business.email); alert(this.i18n.t('emailCopied')); }
    catch { window.prompt(this.i18n.t('copyEmailPrompt'), this.business.email); }
  }

  async shareDetails(): Promise<void> {
    if (navigator.share) {
      try { await navigator.share({ title: this.business?.name || this.i18n.t('shareDefaultTitle'), text: this.shareText, url: window.location.href }); }
      catch { /* המשתמשת ביטלה את חלון השיתוף */ }
    } else {
      try { await navigator.clipboard.writeText(this.shareText); alert(this.i18n.t('detailsCopied')); }
      catch { window.prompt(this.i18n.t('copyDetailsPrompt'), this.shareText); }
    }
  }

  async sendQuestion(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.business) return;
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: Record<string, string> = { businessSlug: this.business.slug };
    formData.forEach((value, key) => { payload[key] = String(value); });
    this.sending = true; this.formMessage = ''; this.formError = false;
    try {
      const response = await fetch(`${environment.supabaseUrl}/functions/v1/send-contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: environment.supabaseAnonKey },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        // הודעות השרת בעברית; באנגלית מציגים הודעה כללית
        throw new Error(this.i18n.isEnglish ? this.i18n.t('sendFail') : (result.error || this.i18n.t('sendFail')));
      }
      this.formMessage = this.i18n.t('bizSentOk');
      form.reset();
    } catch (error) {
      this.formError = true;
      this.formMessage = error instanceof Error && error.message.includes('Failed to fetch') ? this.i18n.t('sendNotConfigured') : (error instanceof Error ? error.message : this.i18n.t('sendFail'));
    } finally { this.sending = false; }
  }
}
