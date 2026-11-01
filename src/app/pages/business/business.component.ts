import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Business } from '../../models/business.model';
import { BusinessService } from '../../services/business.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-business',
  template: `
  @if (business) {
    <header class="business-header"><a class="brand brand-with-tagline" routerLink="/"><span class="pin-mark"></span><span>סמן<small>מסמנים את העסק שלך במפה</small></span></a><a routerLink="/">לאתר סמן</a></header>
    <main class="public-business">
      <div class="public-cover" [style.background-image]="business.imageUrl ? 'url(' + business.imageUrl + ')' : ''"><span class="pin-mark hero-pin" aria-hidden="true"></span></div>
      <section class="public-info">
        @if (business.logoUrl) { <img class="business-logo" [src]="business.logoUrl" [alt]="'הלוגו של ' + business.name"> }
        @if (business.category) { <span class="eyebrow">{{business.category}}</span> }
        <h1>{{business.name}}</h1>
        @if (business.description) { <p class="lead">{{business.description}}</p> }
        @if (business.address) { <p class="detail-line"><span class="detail-icon">⌖</span>{{business.address}}</p> }
        @if (business.hours) { <p class="detail-line"><span class="detail-icon">◷</span>{{business.hours}}</p> }
        <div class="actions">
          @if (business.phone) { <a class="button contact-action" [href]="'tel:' + business.phone"><span aria-hidden="true">☎</span> חיוג לעסק</a> }
          @if (business.whatsapp || business.phone) { <a class="button whatsapp" [href]="whatsappUrl" target="_blank" rel="noopener"><span aria-hidden="true">◉</span> WhatsApp</a> }
          @if (business.email) { <a class="button outline" [href]="'mailto:' + business.email"><span aria-hidden="true">✉</span> שליחת מייל</a> }
          @if (business.phone) { <a class="button outline" [href]="smsUrl">שליחת SMS</a> }
          @if (business.address) { <a class="button outline" [href]="mapsUrl" target="_blank" rel="noopener"><span aria-hidden="true">⌖</span> ניווט לעסק</a> }
          @if (business.website) { <a class="button outline" [href]="websiteUrl" target="_blank" rel="noopener">לאתר העסק</a> }
          <button class="button outline" type="button" (click)="shareDetails()">שיתוף פרטי העסק</button>
        </div>
        <section class="business-contact-card">
          <h2>פרטי העסק</h2>
          @if (business.phone) { <p><strong>טלפון:</strong> <a [href]="'tel:' + business.phone">{{business.phone}}</a></p> }
          @if (business.email) { <p><strong>מייל:</strong> <a [href]="'mailto:' + business.email">{{business.email}}</a></p> }
          @if (business.website) { <p><strong>אתר:</strong> <a [href]="websiteUrl" target="_blank" rel="noopener">{{business.website}}</a></p> }
          @if (business.address) { <p><strong>כתובת:</strong> {{business.address}}</p> }
        </section>
        @if (business.galleryUrls?.length) {
          <section class="business-gallery"><h2>גלריית תמונות</h2><div class="gallery-grid">@for (imageUrl of business.galleryUrls; track imageUrl) { <img [src]="imageUrl" [alt]="'תמונה של ' + business.name" loading="lazy"> }</div></section>
        }
      </section>
      <footer class="public-footer">העמוד נבנה באמצעות <a routerLink="/">סמן – מסמנים את העסק שלך במפה</a></footer>
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
  loading = true;
  constructor(private route: ActivatedRoute, private service: BusinessService, private title: Title, private meta: Meta) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe(async params => {
      this.loading = true;
      try {
        this.business = await this.service.getBySlug(params.get('slug') ?? '');
        if (this.business) {
          this.title.setTitle(`${this.business.name} | סמן`);
          if (this.business.faviconUrl) { let icon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]'); if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); } icon.href = this.business.faviconUrl; }
          this.meta.updateTag({ name: 'description', content: `${this.business.name} – ${this.business.category}. ${this.business.description}`.slice(0, 155) });
        }
      } catch { this.business = undefined; }
      finally { this.loading = false; }
    });
  }
  get phoneForWhatsApp(): string { return (this.business?.whatsapp || this.business?.phone || '').replace(/\D/g, '').replace(/^0/, '972'); }
  get whatsappUrl(): string { return `https://wa.me/${this.phoneForWhatsApp}?text=${encodeURIComponent(this.shareText)}`; }
  get smsUrl(): string { return `sms:${this.business?.phone || ''}?body=${encodeURIComponent(this.shareText)}`; }
  get mapsUrl(): string { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.business?.address || '')}`; }
  get websiteUrl(): string { const value = this.business?.website || ''; return /^https?:\/\//i.test(value) ? value : `https://${value}`; }
  get shareText(): string {
    if (!this.business) return '';
    return `${this.business.name}\n${this.business.category}\nטלפון: ${this.business.phone}\nמייל: ${this.business.email}\nאתר: ${this.business.website}\nכתובת: ${this.business.address}\n${window.location.href}`;
  }
  async shareDetails(): Promise<void> {
    if (navigator.share) {
      try { await navigator.share({ title: this.business?.name || 'פרטי עסק', text: this.shareText, url: window.location.href }); }
      catch { /* המשתמשת ביטלה את חלון השיתוף */ }
    } else {
      await navigator.clipboard?.writeText(this.shareText);
      alert('פרטי העסק הועתקו. אפשר להדביק אותם בהודעה.');
    }
  }
}
