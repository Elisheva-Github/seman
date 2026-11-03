import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessService, Recommendation } from '../../services/business.service';
import { Business } from '../../models/business.model';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-home',
  template: `
  <header class="site-header">
    <a class="brand brand-with-tagline" routerLink="/"><span class="pin-mark"></span><span>סמן<small>מסמנים את העסק שלך במפה</small></span></a>
    <nav aria-label="ניווט ראשי"><a href="#why">למה סמן</a><a href="#how">איך זה עובד</a><a href="#examples">דוגמאות</a><a href="#contact">יצירת קשר</a>@if (showRecommendationsSection && recommendations.length) { <a href="#recommendations">ממליצים על סמן</a> }</nav>
    <a class="button small" href="#contact">אני רוצה עמוד לעסק שלי</a>
  </header>

  <main>
    <section id="top" class="hero">
      <div class="hero-content">
        <span class="eyebrow">נוכחות דיגיטלית לעסקים קטנים ולעצמאיים</span>
        <h1>סמן<span>!</span><br>מסמנים את העסק שלך במפה.</h1>
        <p>אנחנו בסמן יוצרים לעסקים קטנים ולעצמאיים עמוד אינטרנט אישי, פשוט ומקצועי, שמרכז את כל הפרטים החשובים על העסק במקום אחד.</p>
        <p>בלי אתר מורכב, בלי תהליך ארוך ובלי הוצאות מיותרות. פשוט עמוד אחד שמאפשר ללקוחות להכיר אותך, למצוא אותך וליצור איתך קשר.</p>
        <div class="audience-icons" aria-label="למי סמן מיועד">
          <div><span aria-hidden="true">✂</span><b>בעלי מקצוע</b></div>
          <div><span aria-hidden="true">▣</span><b>חנויות ועסקים</b></div>
          <div><span aria-hidden="true">▤</span><b>עצמאיים</b></div>
          <div><span aria-hidden="true">♡</span><b>נותני שירות</b></div>
        </div>
        <div class="actions"><a class="button" href="#contact">אני רוצה עמוד לעסק שלי</a><a class="button outline" href="#why">למה סמן?</a></div>
        <div class="quick-points"><span>✓ בלי ידע טכני</span><span>✓ קישור אחד לשיתוף</span><span>✓ מותאם למובייל</span></div>
      </div>
      <div class="hero-art"><div class="map-circle"><div class="map-line"></div><span class="pin-mark map-pin" aria-hidden="true"></span><div class="map-label">העסק שלך נמצא כאן</div></div></div>
    </section>

    <section id="why" class="section">
      <span class="eyebrow">למה סמן?</span><h2>הלקוחות שלך מחפשים אותך.</h2>
      <p class="lead">אנחנו דואגים שיהיה להם קל למצוא את כל המידע על העסק שלך. במקום לשלוח שוב ושוב מספר טלפון, כתובת ושעות פעילות — פשוט שולחים קישור אחד.</p>
      <h3 class="subheading">כל מה שחשוב ללקוחות שלך במקום אחד</h3>
      <div class="feature-grid">
        <article class="feature"><b>⌂</b><h3>פרטי העסק</h3><p>שם העסק ותיאור השירותים — כדי שידעו בדיוק מה אתם מציעים.</p></article>
        <article class="feature"><b>☎</b><h3>יצירת קשר</h3><p>חיוג ישיר בלחיצה אחת ושליחת הודעת WhatsApp או מייל מהירה.</p></article>
        <article class="feature"><b>⌖</b><h3>מיקום העסק</h3><p>כתובת ברורה וקישור לניווט שמביא לקוחות עד אליכם.</p></article>
        <article class="feature"><b>◷</b><h3>שעות פעילות</h3><p>ימים ושעות ברורים — מתי אפשר להגיע או ליצור קשר.</p></article>
        <article class="feature"><b>▧</b><h3>תמונות מוצרים וסביבה</h3><p>תמונות של מוצרים, שירותים ומקום העסק – ללא תמונות של אנשים.</p></article>
        <article class="feature"><b>◎</b><h3>קישורים חשובים</h3><p>קישור לאתר העסק ולדרכי יצירת קשר נוספות.</p></article>
      </div>
    </section>

    <section id="how" class="section soft">
      <span class="eyebrow">איך זה עובד?</span><h2>שלושה צעדים מהעסק שלך ועד שימצאו אותו.</h2>
      <div class="steps">
        <article><strong>1</strong><h3>מספרים לנו על העסק שלך</h3><p>שולחים לנו את פרטי העסק, תמונות מוצרים ודרכי יצירת קשר.</p></article>
        <article><strong>2</strong><h3>אנחנו בונים לך עמוד</h3><p>יוצרים עבורך עמוד אישי ומסודר עם כל המידע החשוב.</p></article>
        <article><strong>3</strong><h3>העסק שלך מקבל מקום ברשת</h3><p>מקבלים קישור אישי לעמוד שאפשר לשתף עם לקוחות ובכל מקום.</p></article>
      </div>
    </section>

    <section id="examples" class="section soft">
      <span class="eyebrow">דוגמאות</span><h2>ככה נראה עמוד עסק עם סמן.</h2>
      <p class="lead">הצצה לעמודים לדוגמה של עסקים מסוגים שונים — כל אחד עם הפרטים, דרכי הקשר והמיקום שלו.</p>
      <p class="load-feedback" role="status" [hidden]="!businessesError">{{businessesError}}</p>
      @if (!businesses.length && !businessesError) { <p class="empty-businesses">עמודי העסקים שיוצגו בסמן יופיעו כאן בקרוב.</p> }
      <div class="business-grid">
        @for (business of businesses; track business.id) {
          <article class="business-card">
            <div class="business-image" [style.backgroundImage]="business.imageUrl ? 'url(' + business.imageUrl + ')' : null">
              @if (business.logoUrl) { <img class="business-card-logo" [src]="business.logoUrl" [alt]="'הלוגו של ' + business.name"> }
              @if (!business.imageUrl) { <span class="pin-mark card-pin"></span> }
              <span class="business-image-label">עמוד עסק בסמן</span>
            </div>
            <div class="business-info">
              <h3>{{ business.name }}</h3>
              <p>{{ business.category }}@if (business.address) { · {{ business.address }} }</p>
              <a class="card-button" [routerLink]="['/biz', business.slug]">
                <span>לצפייה בעמוד העסק</span><span class="card-button-arrow" aria-hidden="true">←</span>
              </a>
            </div>
          </article>
        }
      </div>
    </section>


    <section id="contact" class="section seman-contact-section">
      <div class="seman-contact-heading">
        <span class="eyebrow">יצירת קשר</span>
        <h2>בואו נדבר!</h2>
        <p class="lead">רוצים להצטרף לסמן או לשמוע פרטים נוספים? נשמח לשמוע מכם.</p>
      </div>
      <div class="seman-contact-cards"><a class="seman-contact-card phone-card" [href]="ownerPhoneHref">
      <span class="seman-contact-icon" aria-hidden="true">☎</span><strong>טלפון</strong>
          <b dir="ltr">{{ownerPhone}}</b><small>לחיוג ישיר</small>
        </a>
        <a class="seman-contact-card email-card" [href]="'mailto:' + ownerEmail">
          <span class="seman-contact-icon" aria-hidden="true">✉</span><strong>דוא״ל</strong>
          <b class="contact-email" dir="ltr">{{ownerEmail}}</b><small>כתבו לנו</small>
        </a>
        @if (hasOwnerWhatsapp) {
          <a class="seman-contact-card whatsapp-card" [href]="ownerWhatsappUrl" target="_blank" rel="noopener">
            <span class="seman-contact-icon" aria-hidden="true">◉</span><strong>WhatsApp</strong>
            <b dir="ltr">{{ownerWhatsapp}}</b><small class="whatsapp-status active">● זמין לפנייה – מספר הוגדר</small>
          </a>
        } @else {
          <div class="seman-contact-card whatsapp-card whatsapp-inactive">
            <span class="seman-contact-icon" aria-hidden="true">◉</span><strong>WhatsApp</strong>
            <small class="whatsapp-status inactive">● לא זמין – לא הוגדר מספר</small>
          </div>
        }
      </div>
      <div class="seman-contact-form-wrap">
        <div class="seman-form-intro"><span class="seman-form-icon">✎</span><h3>או השאירו לנו פרטים</h3><p>נחזור אליכם בהקדם</p></div>
        <form class="seman-contact-form" (submit)="sendContact($event)">
          <label class="honeypot" aria-hidden="true">לא למילוי<input name="company_website" tabindex="-1" autocomplete="off"></label>
          <label>שם מלא<input required name="name" placeholder="איך קוראים לכם?"></label>
          <label>שם העסק<input name="business" placeholder="שם העסק"></label>
          <label>טלפון לחזרה<input name="phone" type="tel" placeholder="052-1234567"></label>
          <label>כתובת דוא״ל<input required type="email" name="email" placeholder="you@example.com"></label>
          <label class="full-field">ספרו לנו קצת על העסק<textarea name="message" rows="3" placeholder="במה נוכל לעזור?"></textarea></label>
          <button class="button seman-submit" type="submit" [disabled]="sending">{{sending ? 'שולחת…' : 'שליחת פרטים'}}</button>
          @if (formMessage) { <p class="form-feedback" [class.form-error]="formError" role="status">{{formMessage}}</p> }
          <small>הפנייה תישלח ישירות למייל של סמן.</small>
        </form>
      </div>
    </section>
    @if (showRecommendationsSection && recommendations.length) {
      <section id="recommendations" class="section">
        <span class="eyebrow">ממליצים על סמן</span>
        <h2>מה הלקוחות שלנו אומרים?</h2>
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
  <footer><a class="brand" routerLink="/"><span class="pin-mark"></span> סמן</a><p>עמוד אינטרנט אישי, פשוט ומקצועי לכל עסק קטן ולעצמאי — כל הפרטים במקום אחד.</p><p>© 2026 סמן. כל הזכויות שמורות.</p></footer>
  `
})
export class HomeComponent {
  businesses: Business[] = [];
  businessesError = '';
  recommendations: Recommendation[] = [];
  showRecommendationsSection = false;
  readonly ownerEmail = environment.ownerEmail;
  readonly ownerPhone = environment.ownerPhone;
  readonly ownerWhatsapp = (environment.ownerWhatsapp || '').replace(/\D/g, '');
  get hasOwnerWhatsapp(): boolean { return /^\d{8,15}$/.test(this.ownerWhatsapp); }
  get ownerWhatsappUrl(): string { return `https://wa.me/${this.ownerWhatsapp}?text=${encodeURIComponent('שלום, הגעתי דרך אתר סמן')}`; }
  sending = false;
  formMessage = '';
  formError = false;
  constructor(private businessService: BusinessService) { void this.loadBusinesses(); }

  async loadBusinesses(): Promise<void> {
    // Load each section independently: a missing recommendations/settings table
    // must never cause the public business examples to disappear.
    try {
      this.businesses = await this.businessService.getExamples();
      this.businessesError = '';
    } catch (error) {
      console.error('Failed to load Seman homepage businesses', error);
      this.businesses = [];
      this.businessesError = 'לא הצלחנו לטעון כרגע את העסקים. כדאי לרענן את העמוד בעוד רגע.';
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
        throw new Error(result.error || 'לא הצלחנו לשלוח את הפנייה. נסי שוב מאוחר יותר.');
      }
      this.formMessage = 'הפנייה נשלחה בהצלחה! נחזור אליך בהקדם.';
      form.reset();
    } catch (error) {
      this.formError = true;
      this.formMessage = error instanceof Error && error.message.includes('Failed to fetch') ? 'שליחת המייל עדיין לא הוגדרה. יש להשלים את חיבור שירות המייל בענן.' : (error instanceof Error ? error.message : 'אירעה שגיאה בשליחת הפנייה.');
    } finally { this.sending = false; }
  }
  get ownerPhoneHref(): string {
  return 'tel:' + String(this.ownerPhone ?? '').replace(/[^0-9+]/g, '');
}
}
