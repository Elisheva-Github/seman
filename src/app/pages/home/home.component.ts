import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessService, Recommendation } from '../../services/business.service';
import { Business } from '../../models/business.model';
import { environment } from '../../../environments/environment';
import { SiteContentService } from '../../services/site-content.service';
import { I18nService } from '../../services/i18n.service';
import { LangSwitchComponent } from '../../shared/lang-switch.component';
import { SiteContent, SiteVisibility, safeUrl, telHref } from '../../models/site-content.model';

@Component({
  standalone: true,
  imports: [RouterLink, LangSwitchComponent],
  selector: 'app-home',
  template: `
  @if (!site.ready) {
    <main class="content-loading" role="status" aria-busy="true" aria-label="טוענת את האתר"><span class="pin-mark" aria-hidden="true"></span></main>
  } @else {
  <a class="skip-link" href="#main-content" (click)="skipToContent($event)">{{i18n.t('skipToContent')}}</a>
  <header class="site-header">
    <a class="brand brand-with-tagline" routerLink="/"><span class="pin-mark"></span><span>סמן@if (c.header.tagline) { <small>{{c.header.tagline}}</small> }</span></a>
    <nav [attr.aria-label]="i18n.t('homeNavLabel')">
      @if (v.why && c.header.navWhy) { <a href="#why">{{c.header.navWhy}}</a> }
      @if (v.how && c.header.navHow) { <a href="#how">{{c.header.navHow}}</a> }
      @if (v.examples && c.header.navExamples) { <a href="#examples">{{c.header.navExamples}}</a> }
      @if (v.contact && c.header.navContact) { <a href="#contact">{{c.header.navContact}}</a> }
      @if (showRecommendationsSection && recommendations.length && c.header.navRecommendations) { <a href="#recommendations">{{c.header.navRecommendations}}</a> }
    </nav>
    @if (v.contact && c.header.cta) { <a class="button small" href="#contact">{{c.header.cta}}</a> }
    <app-lang-switch />
  </header>

  <main id="main-content" tabindex="-1">
    <section id="top" class="hero">
      <div class="hero-content">
        @if (c.hero.eyebrow) { <span class="eyebrow">{{c.hero.eyebrow}}</span> }
        <h1>@for (line of heroLines; track $index) { @if (!$first) { <br> }{{line.text}}@if (line.accent) { <span>{{line.accent}}</span> } }</h1>
        @if (c.hero.paragraph1) { <p class="pre-line">{{c.hero.paragraph1}}</p> }
        @if (c.hero.paragraph2) { <p class="pre-line">{{c.hero.paragraph2}}</p> }
        @if (v.audience && c.audience.items.length) {
          @if (c.audience.title) { <h2 class="audience-title">{{c.audience.title}}</h2> }
          @if (c.audience.description) { <p class="audience-description pre-line">{{c.audience.description}}</p> }
          <div class="audience-icons" [attr.aria-label]="c.audience.title || i18n.t('homeAudienceLabel')">
            @for (item of c.audience.items; track $index) {
              <div>@if (item.icon) { <span aria-hidden="true">{{item.icon}}</span> }<b>{{item.title}}</b></div>
            }
          </div>
        }
        @if ((c.hero.primaryButton && v.contact) || (c.hero.secondaryButton && v.why)) {
          <div class="actions">
            @if (c.hero.primaryButton && v.contact) { <a class="button" href="#contact">{{c.hero.primaryButton}}</a> }
            @if (c.hero.secondaryButton && v.why) { <a class="button outline" href="#why">{{c.hero.secondaryButton}}</a> }
          </div>
        }
        @if (c.hero.points.length) {
          <div class="quick-points">@for (point of c.hero.points; track $index) { <span>✓ {{point.text}}</span> }</div>
        }
      </div>
      <div class="hero-art"><div class="map-circle"><div class="map-line"></div><span class="pin-mark map-pin" aria-hidden="true"></span>@if (c.hero.mapLabel) { <div class="map-label">{{c.hero.mapLabel}}</div> }</div></div>
    </section>

    @if (v.why) {
      <section id="why" class="section">
        @if (c.why.eyebrow) { <span class="eyebrow">{{c.why.eyebrow}}</span> }
        @if (c.why.title) { <h2>{{c.why.title}}</h2> }
        @if (c.why.lead) { <p class="lead pre-line">{{c.why.lead}}</p> }
        @if (c.why.subheading) { <h3 class="subheading">{{c.why.subheading}}</h3> }
        @if (c.why.features.length) {
          <div class="feature-grid">
            @for (feature of c.why.features; track $index) {
              <article class="feature">@if (feature.icon) { <b>{{feature.icon}}</b> }<h3>{{feature.title}}</h3><p class="pre-line">{{feature.text}}</p></article>
            }
          </div>
        }
      </section>
    }

    @if (v.how) {
      <section id="how" class="section soft">
        @if (c.how.eyebrow) { <span class="eyebrow">{{c.how.eyebrow}}</span> }
        @if (c.how.title) { <h2>{{c.how.title}}</h2> }
        @if (c.how.lead) { <p class="lead pre-line">{{c.how.lead}}</p> }
        <div class="steps">
          @for (step of c.how.steps; track $index) {
            <article><strong>{{$index + 1}}</strong><h3>{{step.title}}</h3><p class="pre-line">{{step.text}}</p></article>
          }
        </div>
      </section>
    }

    @if (v.examples) {
      <section id="examples" class="section soft">
        @if (c.examples.eyebrow) { <span class="eyebrow">{{c.examples.eyebrow}}</span> }
        @if (c.examples.title) { <h2>{{c.examples.title}}</h2> }
        @if (c.examples.lead) { <p class="lead pre-line">{{c.examples.lead}}</p> }
        <p class="load-feedback" role="status" [hidden]="!businessesError">{{businessesError}}</p>
        @if (!businesses.length && !businessesError && c.examples.emptyText) { <p class="empty-businesses">{{c.examples.emptyText}}</p> }
        <div class="business-grid">
          @for (business of businesses; track business.id) {
            <article class="business-card">
              <div class="business-image" [style.backgroundImage]="cssUrl(business.imageUrl)">
                @if (business.logoUrl) { <img class="business-card-logo" [src]="business.logoUrl" [alt]="i18n.t('logoOf', {name: business.name})"> }
                @if (!business.imageUrl) { <span class="pin-mark card-pin"></span> }
                @if (c.examples.cardLabel) { <span class="business-image-label">{{c.examples.cardLabel}}</span> }
              </div>
              <div class="business-info">
                <h3>{{ business.name }}</h3>
                <p>{{ business.category }}@if (business.address) { · {{ business.address }} }</p>
                <a class="card-button" [routerLink]="['/biz', business.slug]">
                  <span>{{c.examples.cardButton || i18n.t('homeBizOf')}}</span><span class="card-button-arrow" aria-hidden="true">←</span>
                </a>
              </div>
            </article>
          }
        </div>
      </section>
    }

    @if (v.contact) {
      <section id="contact" class="section seman-contact-section">
        <div class="seman-contact-heading">
          @if (c.contact.eyebrow) { <span class="eyebrow">{{c.contact.eyebrow}}</span> }
          @if (c.contact.title) { <h2>{{c.contact.title}}</h2> }
          @if (c.contact.lead) { <p class="lead pre-line">{{c.contact.lead}}</p> }
        </div>
        <div class="seman-contact-cards">
          @if (contactPhoneHref) {
            <a class="seman-contact-card phone-card" [href]="contactPhoneHref">
              <span class="seman-contact-icon" aria-hidden="true">☎</span><strong>{{i18n.t('homePhone')}}</strong>
              <b dir="ltr">{{c.contact.phone}}</b><small>{{i18n.t('homePhoneHint')}}</small>
            </a>
          }
          @if (c.contact.email) {
            <a class="seman-contact-card email-card" [href]="'mailto:' + c.contact.email">
              <span class="seman-contact-icon" aria-hidden="true">✉</span><strong>{{i18n.t('homeEmail')}}</strong>
              <b class="contact-email" dir="ltr">{{c.contact.email}}</b><small>{{i18n.t('homeEmailHint')}}</small>
            </a>
          }
          @if (hasOwnerWhatsapp) {
            <a class="seman-contact-card whatsapp-card" [href]="ownerWhatsappUrl" target="_blank" rel="noopener">
              <span class="seman-contact-icon" aria-hidden="true">◉</span><strong>WhatsApp</strong>
              <b dir="ltr">{{ownerWhatsapp}}</b><small class="whatsapp-status active">{{i18n.t('homeWaOk')}}</small>
            </a>
          } @else {
            <div class="seman-contact-card whatsapp-card whatsapp-inactive">
              <span class="seman-contact-icon" aria-hidden="true">◉</span><strong>WhatsApp</strong>
              <small class="whatsapp-status inactive">{{i18n.t('homeWaNo')}}</small>
            </div>
          }
        </div>
        <div class="seman-contact-form-wrap">
          <div class="seman-form-intro"><span class="seman-form-icon">✎</span>@if (c.contact.formTitle) { <h3>{{c.contact.formTitle}}</h3> }@if (c.contact.formSubtitle) { <p>{{c.contact.formSubtitle}}</p> }</div>
          <form class="seman-contact-form" (submit)="sendContact($event)">
            <label class="honeypot" aria-hidden="true">{{i18n.t('notToFill')}}<input name="company_website" tabindex="-1" autocomplete="off"></label>
            <label>{{i18n.t('fullName')}}<input required name="name" maxlength="120" autocomplete="name" [placeholder]="i18n.t('homeFormNamePh')"></label>
            <label>{{i18n.t('homeBusinessName')}}<input name="business" maxlength="120" [placeholder]="i18n.t('homeBusinessNamePh')"></label>
            <label>{{i18n.t('homePhoneBack')}}<input name="phone" type="tel" maxlength="50" autocomplete="tel" placeholder="052-1234567"></label>
            <label>{{i18n.t('emailLabel')}}<input required type="email" name="email" maxlength="200" autocomplete="email" placeholder="you@example.com"></label>
            <label class="full-field">{{i18n.t('homeAbout')}}<textarea name="message" rows="3" maxlength="3000" [placeholder]="i18n.t('homeAboutPh')"></textarea></label>
            <button class="button seman-submit" type="submit" [disabled]="sending">{{sending ? i18n.t('sending') : (c.contact.submitButton || i18n.t('submit'))}}</button>
            @if (formMessage) { <p class="form-feedback" [class.form-error]="formError" role="status">{{formMessage}}</p> }
            @if (c.contact.formNote) { <small>{{c.contact.formNote}}</small> }
          </form>
        </div>
      </section>
    }

    @if (showRecommendationsSection && recommendations.length) {
      <section id="recommendations" class="section">
        @if (c.recommendations.eyebrow) { <span class="eyebrow">{{c.recommendations.eyebrow}}</span> }
        @if (c.recommendations.title) { <h2>{{c.recommendations.title}}</h2> }
        @if (c.recommendations.intro) { <p class="lead pre-line">{{c.recommendations.intro}}</p> }
        <div class="business-grid recommendations-grid">
          @for (recommendation of recommendations; track recommendation.id) {
            <article class="feature recommendation-card">
              <span aria-hidden="true">★★★★★</span>
              <p>{{recommendation.content}}</p>
              <strong>{{recommendation.customerName}}</strong>
            </article>
          }
        </div>
      </section>
    }
  </main>

  @if (v.footer) {
    <footer>
      <a class="brand" routerLink="/"><span class="pin-mark"></span> סמן</a>
      @if (c.footer.description) { <p class="pre-line">{{c.footer.description}}</p> }
      @if (footerPhoneHref || c.footer.email) {
        <p class="footer-contact">
          @if (footerPhoneHref) { <a [href]="footerPhoneHref" dir="ltr">{{c.footer.phone}}</a> }
          @if (c.footer.email) { <a [href]="'mailto:' + c.footer.email" dir="ltr">{{c.footer.email}}</a> }
        </p>
      }
      @if (footerLinks.length) {
        <nav class="footer-links" [attr.aria-label]="i18n.t('homeFooterLinks')">
          @for (link of footerLinks; track $index) {
            @if (link.external) { <a [href]="link.url" target="_blank" rel="noopener noreferrer">{{link.label}}</a> }
            @else { <a [href]="link.url">{{link.label}}</a> }
          }
        </nav>
      }
      @if (c.footer.copyright) { <p>{{c.footer.copyright}}</p> }
      <p class="footer-a11y"><a routerLink="/accessibility">{{i18n.t('a11yStatement')}}</a></p>
    </footer>
  }
  }
  `
})
export class HomeComponent {
  businesses: Business[] = [];
  businessesError = '';
  recommendations: Recommendation[] = [];
  showRecommendationsSection = false;
  sending = false;
  formMessage = '';
  formError = false;

  // תוכן האתר (ניתן לעריכה במסך הניהול). נחשב מחדש בכל פעם שהתוכן נטען.
  c!: SiteContent;
  v!: SiteVisibility;
  heroLines: { text: string; accent: string }[] = [];
  ownerWhatsapp = '';
  contactPhoneHref = '';
  footerPhoneHref = '';
  footerLinks: { label: string; url: string; external: boolean }[] = [];

  get hasOwnerWhatsapp(): boolean { return /^\d{8,15}$/.test(this.ownerWhatsapp); }
  get ownerWhatsappUrl(): string { return `https://wa.me/${this.ownerWhatsapp}?text=${encodeURIComponent('שלום, הגעתי דרך אתר סמן')}`; }

  constructor(private businessService: BusinessService, public site: SiteContentService, public i18n: I18nService) {
    this.applyContent();
    this.i18n.onChange(() => this.applyContent());
    void this.site.load().then(() => this.applyContent());
    void this.loadBusinesses();
  }

  private applyContent(): void {
    this.c = this.site.localized(this.i18n.lang);
    this.v = this.site.visibility;
    // השורה הראשונה של הכותרת הראשית מסתיימת לעיתים בסימן קריאה שמוצג בצבע המותג
    this.heroLines = this.c.hero.title.split('\n').map(line => {
      const match = line.match(/^(.*?)([!！]+)$/);
      return match ? { text: match[1], accent: match[2] } : { text: line, accent: '' };
    });
    this.ownerWhatsapp = (this.c.contact.whatsapp || '').replace(/\D/g, '');
    this.contactPhoneHref = telHref(this.c.contact.phone);
    this.footerPhoneHref = telHref(this.c.footer.phone);
    this.footerLinks = this.c.footer.links
      .map(link => ({ label: link.label, url: safeUrl(link.url) }))
      .filter(link => link.label && link.url)
      .map(link => ({ ...link, external: /^https?:\/\//i.test(link.url) }));
  }

  skipToContent(event: Event): void {
    event.preventDefault();
    const main = document.getElementById('main-content');
    main?.focus();
    main?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  /** כתובת תמונה בטוחה לשימוש ב-CSS background-image (מונעת הזרקת CSS דרך כתובת עם סוגריים/מירכאות) */
  cssUrl(url: string): string | null {
    return url ? `url("${encodeURI(url).replace(/"/g, '%22').replace(/\(/g, '%28').replace(/\)/g, '%29')}")` : null;
  }

  async loadBusinesses(): Promise<void> {
    // Load each section independently: a missing recommendations/settings table
    // must never cause the public business examples to disappear.
    try {
      this.businesses = await this.businessService.getExamples();
      this.businessesError = '';
    } catch (error) {
      console.error('Failed to load Seman homepage businesses', error);
      this.businesses = [];
      this.businessesError = this.i18n.t('homeBizLoadFail');
    }

    try {
      const settings = await this.businessService.getSettings();
      this.showRecommendationsSection = settings.showRecommendationsSection;
    } catch {
      this.showRecommendationsSection = false;
    }

    try {
      this.recommendations = await this.businessService.getRecommendations(false, null);
    } catch {
      this.recommendations = [];
    }
  }

  async sendContact(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const payload: Record<string, string> = {};
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
        throw new Error(this.i18n.isEnglish ? this.i18n.t('sendFail') : (result.error || this.i18n.t('sendFail')));
      }
      this.formMessage = this.c.contact.successMessage || this.i18n.t('bizSentOk');
      form.reset();
    } catch (error) {
      this.formError = true;
      this.formMessage = error instanceof Error && error.message.includes('Failed to fetch') ? this.i18n.t('homeSendFail') : (error instanceof Error ? error.message : this.i18n.t('homeGenericFail'));
    } finally { this.sending = false; }
  }
}
