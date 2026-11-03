import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Business } from '../../models/business.model';
import { BusinessService, Recommendation } from '../../services/business.service';
import { environment } from '../../../environments/environment';
import { SiteContentService } from '../../services/site-content.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-business',
  template: `
  @if (business) {
    <header class="business-header">
      <a class="brand brand-with-tagline" routerLink="/"><span class="pin-mark"></span><span>סמן@if (site.content.header.tagline) { <small>{{site.content.header.tagline}}</small> }</span></a>
      <nav class="business-page-nav" aria-label="ניווט בעמוד העסק">
        <a href="#business-top" (click)="scrollToSection($event, 'business-top')">ראש העמוד</a>
        <a href="#business-contact" (click)="scrollToSection($event, 'business-contact')">יצירת קשר</a>
        @if (business.galleryUrls.length) { <a href="#business-gallery" (click)="scrollToSection($event, 'business-gallery')">גלריה</a> }
        @if (recommendations.length) { <a href="#business-recommendations" (click)="scrollToSection($event, 'business-recommendations')">המלצות</a> }
        <a href="#business-question" (click)="scrollToSection($event, 'business-question')">השאירו הודעה</a>
      </nav>
      <a routerLink="/">לאתר סמן</a>
    </header>
    <main class="public-business business-page-redesign">
      <section id="business-top" class="business-top-section">
        <div class="business-cover-wrap">
          @if (business.imageUrl) { <img class="business-cover-image" [src]="business.imageUrl" [alt]="'תמונה של ' + business.name"> }
          @else { <div class="business-cover-placeholder"><span class="pin-mark hero-pin" aria-hidden="true"></span></div> }
          @if (business.logoUrl) { <div class="business-logo-badge"><img [src]="business.logoUrl" [alt]="'הלוגו של ' + business.name"></div> }
        </div>
        <div class="business-intro">
          @if (business.category) { <span class="eyebrow">{{business.category}}</span> }
          <h1>{{business.name}}</h1>
          @if (business.description) { <p class="lead">{{business.description}}</p> }
          @if (business.hours) { <p class="detail-line"><span class="detail-icon">◷</span>{{business.hours}}</p> }
        </div>
      </section>

      <section id="business-contact" class="business-contact-section">
        <div class="section-heading-center"><span class="eyebrow">נשמח לעמוד לשירותכם</span><h2>דברו איתנו</h2><p>כל דרכי יצירת הקשר עם {{business.name}} במקום אחד</p></div>
        <div class="business-contact-tiles">
          @if (business.address) {
            <a class="business-contact-tile address-tile" [href]="mapsUrl" target="_blank" rel="noopener">
              <span class="tile-icon">⌖</span><strong>כתובת</strong><span>{{business.address}}</span><small>לניווט במפה ←</small>
            </a>
          }
          @if (business.phone) {
            <a class="business-contact-tile phone-tile" [href]="'tel:' + business.phone">
              <span class="tile-icon">☎</span><strong>טלפון</strong><span dir="ltr">{{business.phone}}</span><small>לחיוג ←</small>
            </a>
          }
          @if (business.email || business.website) {
            <div class="business-contact-tile email-tile">
              <span class="tile-icon">✉</span><strong>דוא״ל</strong>
              @if (business.email) { <span class="email-copy-line" dir="ltr">{{business.email}} <button type="button" class="copy-email-button" (click)="copyEmail()" aria-label="העתקת כתובת המייל" title="העתקת מייל">⧉</button></span> }
              @if (business.website) { <a class="tile-website" [href]="websiteUrl" target="_blank" rel="noopener" dir="ltr">{{business.website}}</a> }
              @if (business.email) { <a class="tile-email-link" [href]="'mailto:' + business.email">שליחת מייל</a> }
            </div>
          }
        </div>
        <div class="business-extra-actions">
          @if (hasWhatsApp) { <a class="button whatsapp" [href]="whatsappUrl" target="_blank" rel="noopener">◉ שליחת הודעת WhatsApp</a> }
          @else { <span class="whatsapp-unavailable">{{business.phone || business.email ? 'WhatsApp לא זמין בעסק זה. אפשר להתקשר או לשלוח מייל.' : 'WhatsApp אינו זמין בעסק זה.'}}</span> }
          @if (business.phone) { <a class="button outline" [href]="smsUrl">✉ שליחת SMS</a> }
          <button class="button outline" type="button" (click)="shareDetails()">↗ שיתוף העסק</button>
        </div>
      </section>

@if (business.galleryUrls.length) {
        <section id="business-gallery" class="business-gallery"><h2>קצת מהעסק שלנו</h2><div class="gallery-grid">@for (imageUrl of business.galleryUrls; track $index) { <img [src]="imageUrl" [alt]="'תמונה של ' + business.name" loading="lazy"> }</div></section>
      }

      <section id="business-question" class="business-question-section">
        <div class="question-heading"><span class="question-icon">✉</span><h2>יש לכם שאלה?</h2><p>השאירו פרטים ונחזור אליכם בהקדם</p></div>
        <form class="business-question-form" (submit)="sendQuestion($event)">
          <label class="honeypot" aria-hidden="true">לא למילוי<input name="company_website" tabindex="-1" autocomplete="off"></label>
          <label>שם מלא<input required name="name" placeholder="איך קוראים לכם?"></label>
          <label>טלפון<input name="phone" type="tel" placeholder="מספר טלפון לחזרה"></label>
          <label>כתובת דוא״ל<input required name="email" type="email" placeholder="כתובת המייל שלכם"></label>
          <label class="full-field">תוכן ההודעה<textarea name="message" rows="4" placeholder="כתבו לנו במה נוכל לעזור..."></textarea></label>
          <button class="button seman-submit" type="submit" [disabled]="sending">{{sending ? 'שולחת…' : 'שליחת פרטים'}}</button>
          @if (formMessage) { <p class="form-feedback" [class.form-error]="formError" role="status">{{formMessage}}</p> }
          <small>הפנייה תישלח לכתובת הדוא״ל של העסק.</small>
        </form>
      </section>

      @if (recommendations.length) {
        <section id="business-recommendations" class="section business-recommendations-section">
          <div class="section-heading-center"><span class="eyebrow">ממליצים על {{business.name}}</span><h2>מה הלקוחות שלנו אומרים?</h2></div>
          <div class="business-recommendations-grid">
            @for (recommendation of recommendations; track recommendation.id) {
              <article class="feature recommendation-card"><span aria-hidden="true">★★★★★</span><p>{{recommendation.content}}</p><strong>{{recommendation.customerName}}</strong></article>
            }
          </div>
        </section>
      }
      <footer class="business-brand-footer">
        <a class="brand brand-with-tagline" routerLink="/"><span class="pin-mark"></span><span>סמן@if (site.content.header.tagline) { <small>{{site.content.header.tagline}}</small> }</span></a>
        <p>© כל הזכויות שמורות {{business.name}}</p>
      </footer>
    </main>
  } @else if (loading) {
    <main class="not-found"><p>טוענת את פרטי העסק…</p></main>
  } @else {
    <main class="not-found"><h1>העמוד לא נמצא</h1><p>ייתכן שהקישור שגוי או שהעמוד אינו מפורסם.</p><a class="button" routerLink="/">חזרה לאתר סמן</a></main>
  }
  `
})
export class BusinessComponent implements OnInit {
  business?: Business;
  recommendations: Recommendation[] = [];
  loading = true;
  sending = false;
  formMessage = '';
  formError = false;
  constructor(private route: ActivatedRoute, private service: BusinessService, private title: Title, private meta: Meta, public site: SiteContentService) { void this.site.load(); }
  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      this.loading = true;
      try {
        this.business = await this.service.getBySlug(params.get('slug') ?? '');
        if (this.business) {
          this.title.setTitle(`${this.business.name} | סמן`);
          const icon = this.ensureFaviconLink();
          icon.href = this.business.faviconUrl || '/favicon.svg';
          void this.trackVisit(this.business.id);
          if (this.business.showRecommendations) {
            try { this.recommendations = await this.service.getRecommendations(false, this.business.id); }
            catch { this.recommendations = []; }
          } else {
            this.recommendations = [];
          }
          this.meta.updateTag({ name: 'description', content: `${this.business.name} – ${this.business.category}. ${this.business.description}`.slice(0, 155) });
          this.meta.updateTag({ name: 'robots', content: 'index,follow' });
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
  scrollToSection(event: Event, sectionId: string): void {
    event.preventDefault();
    event.stopPropagation();
    const target = document.getElementById(sectionId);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    return `${this.business.name}\n${this.business.category}\nטלפון: ${this.business.phone}\nמייל: ${this.business.email}\nאתר: ${this.business.website}\nכתובת: ${this.business.address}\n${window.location.href}`;
  }
  async copyEmail(): Promise<void> {
    if (!this.business?.email) return;
    try { await navigator.clipboard.writeText(this.business.email); alert('כתובת המייל הועתקה.'); }
    catch { window.prompt('העתיקו את כתובת המייל:', this.business.email); }
  }
  async shareDetails(): Promise<void> {
    if (navigator.share) {
      try { await navigator.share({ title: this.business?.name || 'פרטי עסק', text: this.shareText, url: window.location.href }); }
      catch { /* המשתמשת ביטלה את חלון השיתוף */ }
    } else {
      try { await navigator.clipboard.writeText(this.shareText); alert('פרטי העסק הועתקו. אפשר להדביק אותם בהודעה.'); }
      catch { window.prompt('העתיקו את פרטי העסק:', this.shareText); }
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
        throw new Error(result.error || 'לא הצלחנו לשלוח את הפנייה. נסו שוב מאוחר יותר.');
      }
      this.formMessage = 'הפנייה נשלחה בהצלחה! העסק יחזור אליכם בהקדם.';
      form.reset();
    } catch (error) {
      this.formError = true;
      this.formMessage = error instanceof Error && error.message.includes('Failed to fetch') ? 'שליחת הפנייה עדיין לא הוגדרה בענן.' : (error instanceof Error ? error.message : 'אירעה שגיאה בשליחת הפנייה.');
    } finally { this.sending = false; }
  }
}
