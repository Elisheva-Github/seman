import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { Business } from '../../models/business.model';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [RouterLink],
  selector: 'app-home',
  template: `
  <header class="site-header">
    <a class="brand" routerLink="/"><span class="pin-mark"></span> סמן</a>
    <nav aria-label="ניווט ראשי"><a href="#why">למה סמן</a><a href="#how">איך זה עובד</a><a href="#examples">דוגמאות</a><a href="#audience">למי מתאים</a><a href="#contact">יצירת קשר</a></nav>
    <a class="button small" href="#contact">אני רוצה עמוד לעסק שלי</a>
  </header>

  <main>
    <section id="top" class="hero">
      <div class="hero-content">
        <span class="eyebrow">נוכחות דיגיטלית לעסקים קטנים ולעצמאיים</span>
        <h1>סמן<span>!</span><br>מסמנים את העסק שלך במפה.</h1>
        <p>אנחנו בסמן יוצרים לעסקים קטנים ולעצמאיים עמוד אינטרנט אישי, פשוט ומקצועי, שמרכז את כל הפרטים החשובים על העסק במקום אחד.</p>
        <p>בלי אתר מורכב, בלי תהליך ארוך ובלי הוצאות מיותרות. פשוט עמוד אחד שמאפשר ללקוחות להכיר אותך, למצוא אותך וליצור איתך קשר.</p>
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

    <section id="audience" class="section">
      <span class="eyebrow">למי השירות מתאים?</span><h2>לכל עסק קטן או עצמאי שרוצה להיות נגיש וקל למציאה באינטרנט.</h2>
      <div class="tags"><span>פאניות</span><span>קוסמטיקאיות</span><span>בעלי מקצוע</span><span>חנויות ועסקים מקומיים</span><span>מכירות ביתיות</span><span>יועצים ועצמאיים</span><span>חוגים וסדנאות</span></div>
      <p class="lead audience-note">לא משנה באיזה תחום העסק שלך — גם לך מגיע עמוד אינטרנט משלך.</p>
    </section>

    <section id="examples" class="section soft">
      <span class="eyebrow">דוגמאות</span><h2>ככה נראה עמוד עסק עם סמן.</h2>
      <p class="lead">הצצה לעמודים לדוגמה של עסקים מסוגים שונים — כל אחד עם הפרטים, דרכי הקשר והמיקום שלו.</p>
      <div class="business-grid">
        @for (business of businesses; track business.id) {
          <article class="business-card">
            <div class="business-image"><span class="pin-mark card-pin"></span></div>
            <div class="business-info"><h3>{{ business.name }}</h3><p>{{ business.category }} · {{ business.address }}</p><a [routerLink]="['/biz', business.slug]">לצפייה בעמוד לדוגמה ←</a></div>
          </article>
        }
      </div>
    </section>

    <section id="digital-card" class="section digital-card-section">
      <span class="eyebrow">כרטיס ביקור דיגיטלי</span><h2>וגם כרטיס ביקור דיגיטלי, בכיס של הלקוח.</h2>
      <p class="lead">בנוסף לעמוד העסק, אפשר לשתף את פרטי העסק בקלות ולשמור אותם באנשי הקשר בטלפון.</p>
      <div class="digital-card-points"><span>✓ פרטי העסק במקום אחד</span><span>✓ טלפון, מייל וכתובת</span><span>✓ קישור אחד לשיתוף</span></div>
    </section>

    <section id="contact" class="section contact">
      <div><span class="eyebrow">יצירת קשר</span><h2>יש לך עסק ורוצה לתת לו מקום ברשת?</h2><p class="lead">נשמח לשמוע ממך! אפשר ליצור קשר ישירות בדרך שהכי נוחה לך.</p><p>טלפון: <a href="tel:0527192121">052-719-2121</a></p><p>אימייל: <a [href]="'mailto:' + ownerEmail">{{ownerEmail}}</a></p></div>
      <form (submit)="sendContact($event)">
        <label class="honeypot" aria-hidden="true">לא למילוי<input name="company_website" tabindex="-1" autocomplete="off"></label>
        <label>שם מלא<input required name="name" placeholder="ישראל ישראלי"></label>
        <label>שם העסק<input name="business" placeholder="שם העסק"></label>
        <label>אימייל<input required type="email" name="email" placeholder="you@example.com"></label>
        <label>טלפון<input name="phone" placeholder="052-1234567"></label>
        <label>ספרו לנו על העסק<textarea name="message" rows="3"></textarea></label>
        <button class="button" type="submit" [disabled]="sending">{{sending ? 'שולחת…' : 'שליחת פנייה'}}</button>
        @if (formMessage) { <p class="form-feedback" [class.form-error]="formError" role="status">{{formMessage}}</p> }
        <small>הפנייה תישלח ישירות למייל של סמן.</small>
      </form>
    </section>
  </main>
  <footer><a class="brand" routerLink="/"><span class="pin-mark"></span> סמן</a><p>עמוד אינטרנט אישי, פשוט ומקצועי לכל עסק קטן ולעצמאי — כל הפרטים במקום אחד.</p><a routerLink="/admin">כניסה לניהול</a><p>© 2026 סמן. כל הזכויות שמורות.</p></footer>
  `
})
export class HomeComponent {
  businesses: Business[] = [];
  readonly ownerEmail = environment.ownerEmail;
  sending = false;
  formMessage = '';
  formError = false;
  constructor(private businessService: BusinessService) { void this.loadBusinesses(); }

  async loadBusinesses(): Promise<void> {
    try { this.businesses = await this.businessService.getPublished(); }
    catch { this.businesses = []; }
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
}
