
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Business } from '../../models/business.model';
import { BusinessService, Recommendation, SemanSettings } from '../../services/business.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  selector: 'app-admin',
  template: `
  <div class="admin-shell">
    <header class="admin-header">
      <a class="brand" routerLink="/">
        <span class="pin-mark" aria-hidden="true"></span> סמן
      </a>
      <span>מערכת ניהול עסקים</span>
      <div class="header-actions">
        <a routerLink="/">חזרה לאתר ←</a>
        @if (cloudMode && loggedIn) {
          <button class="text-button" (click)="logout()">התנתקות</button>
        }
      </div>
    </header>

    <main class="admin-main">
      @if (cloudMode && !loggedIn) {
        <section class="login-card">
          <span class="eyebrow">ניהול מאובטח</span>
          <h1>כניסה למערכת סמן</h1>
          <p>התחברי עם משתמש מנהלת שיצרת בפרויקט Supabase.</p>

          <form (ngSubmit)="login()">
            <label>
              כתובת מייל
              <input
                type="email"
                required
                [(ngModel)]="loginEmail"
                name="loginEmail"
                autocomplete="username">
            </label>

            <label>
              סיסמה
              <input
                type="password"
                required
                [(ngModel)]="loginPassword"
                name="loginPassword"
                autocomplete="current-password">
            </label>

            <button class="button" type="submit" [disabled]="busy">
              {{busy ? 'מתחברת…' : 'כניסה למערכת'}}
            </button>
          </form>

          @if (error) {
            <p class="form-error">{{error}}</p>
          }
        </section>
      } @else {
        <div class="admin-title">
          <div>
            <span class="eyebrow">אזור ניהול</span>
            <h1>העסקים שלי</h1>
            <p>מכאן יוצרים עמודים חדשים ומנהלים את כל לקוחות סמן.</p>
          </div>
          <button class="button" (click)="newBusiness()">+ הוספת עסק חדש</button>
        </div>

        @if (!cloudMode) {
          <div class="notice warning">
            המערכת עדיין במצב מקומי. הנתונים נשמרים בדפדפן הזה בלבד.
            כדי להעביר אותם לענן, הגדירי Supabase לפי קובץ SETUP-CLOUD.md.
          </div>
        }

        @if (cloudMode && localCount > 0) {
          <div class="notice">
            נמצאו {{localCount}} עסקים שנשמרו בעבר בדפדפן הזה.
            <button class="button outline small" (click)="migrateLocal()" [disabled]="busy">
              ייבוא הנתונים לענן
            </button>
          </div>
        }

        @if (error) {
          <div class="notice warning">{{error}}</div>
        }

        @if (loading) {
          <p>טוענת עסקים…</p>
        } @else if (!businesses.length) {
          <div class="empty-state">
            עדיין אין עסקים. לחצי על „הוספת עסק חדש” כדי ליצור את העמוד הראשון.
          </div>
        }

        <div class="admin-list">
          @for (business of businesses; track business.id) {
            <article class="admin-row">
              <div class="admin-avatar">
                <span class="pin-mark"></span>
              </div>

              <div class="admin-details">
                <h3>{{business.name}}</h3>
                <p>{{business.category}} · {{business.address}}</p>
                <a [href]="businessUrl(business)" target="_blank" rel="noopener">
                  פתיחת העמוד הציבורי ↗
                </a>
              </div>

              <span class="status" [class.off]="!business.published">
                {{business.published ? 'פעיל – קישור זמין' : 'לא פעיל – קישור חסום'}}
              </span>

              <div class="admin-actions">
                <button class="admin-action" type="button" (click)="toggleBusiness(business, 'published')" [disabled]="busy">
                  {{business.published ? 'השבתת עסק' : 'הפעלת עסק'}}
                </button>
                <button class="admin-action" type="button" (click)="toggleBusiness(business, 'showInExamples')" [disabled]="busy">
                  {{business.showInExamples ? 'הסתרה מדף סמן' : 'הצגה באתר סמן'}}
                </button>
                <button class="admin-action" type="button" (click)="toggleBusiness(business, 'showRecommendations')" [disabled]="busy">
                  {{business.showRecommendations ? 'הסתרת המלצות' : 'הצגת המלצות'}}
                </button>
                <button class="admin-action delete-action" type="button" (click)="removeBusinessRecommendations(business)" [disabled]="busy">מחיקת המלצות לעסק</button>
                <button class="admin-action" type="button" (click)="toggleBusiness(business, 'sendVisitReportEmail')" [disabled]="busy">
                  {{business.sendVisitReportEmail ? 'ביטול דוח יומי' : 'הפעלת דוח יומי'}}
                </button>
                <button class="admin-action" type="button" (click)="share(business, 'copy')">
                  <span aria-hidden="true">⧉</span> העתקת קישור
                </button>
                <button class="admin-action whatsapp-action" type="button" (click)="share(business, 'whatsapp')">
                  <span aria-hidden="true">◉</span> WhatsApp
                </button>
                <button class="admin-action" type="button" (click)="share(business, 'sms')">
                  <span aria-hidden="true">✉</span> SMS
                </button>
                <button class="admin-action" type="button" (click)="share(business, 'email')">
                  <span aria-hidden="true">＠</span> מייל
                </button>
                <button class="admin-action edit-action" type="button" (click)="edit(business)">
                  <span aria-hidden="true">✎</span> עריכה
                </button>
                <button class="admin-action delete-action" type="button" (click)="remove(business.id)">
                  <span aria-hidden="true">×</span> מחיקה
                </button>
              </div>
            </article>
          }
        </div>

        <section class="editor admin-settings">
          <h2>הגדרות אתר</h2>
          <label class="check">
            <input type="checkbox" [(ngModel)]="settings.sendVisitReportEmail" name="sendVisitReportEmail" (change)="saveSiteSettings()">
            שליחת דוחות כניסות למייל מופעלת
          </label>
          <p class="hint">המתג שומר את ההעדפה. כדי לשלוח דוח בפועל נדרש להגדיר גם מדידת כניסות, כתובת יעד ושירות מייל מתוזמן בצד השרת.</p>
          <label class="check">
            <input type="checkbox" [(ngModel)]="settings.showRecommendationsSection" name="showRecommendationsSection" (change)="saveSiteSettings()">
            להציג את אזור המלצות הלקוחות באתר
          </label>
          @if (settingsError) { <p class="form-error">{{settingsError}}</p> }
        </section>

        <section class="editor recommendations-admin">
          <h2>המלצות לקוחות</h2>
          <p>הוסיפי המלצות שיוצגו באתר כאשר אזור ההמלצות מופעל.</p>
          <div class="form-grid">
            <label>שם הלקוח
              <input [(ngModel)]="recommendationDraft.customerName" name="recommendationCustomerName">
            </label>
            <label>שיוך המלצה
              <select [(ngModel)]="recommendationDraft.businessId" name="recommendationBusiness">
                <option value="">המלצות על סמן – האתר הראשי</option>
                @for (business of businesses; track business.id) {
                  <option [value]="business.id">{{business.name}}</option>
                }
              </select>
            </label>
            <label>סדר הצגה
              <input type="number" min="0" [(ngModel)]="recommendationDraft.displayOrder" name="recommendationOrder">
            </label>
            <label class="wide">תוכן ההמלצה
              <textarea rows="3" [(ngModel)]="recommendationDraft.content" name="recommendationContent"></textarea>
            </label>
            <label class="check">
              <input type="checkbox" [(ngModel)]="recommendationDraft.published" name="recommendationPublished">
              להציג המלצה זו באתר
            </label>
          </div>
          <div class="actions">
            <button class="button" type="button" (click)="saveRecommendation()" [disabled]="busy || !recommendationDraft.customerName.trim() || !recommendationDraft.content.trim()">
              {{recommendationDraft.id ? 'שמירת שינויים' : 'הוספת המלצה'}}
            </button>
            @if (recommendationDraft.id) {
              <button class="button outline" type="button" (click)="resetRecommendationDraft()">ביטול עריכה</button>
            }
          </div>
          @if (recommendationsError) { <p class="form-error">{{recommendationsError}}</p> }
          <div class="admin-list">
            @for (recommendation of recommendations; track recommendation.id) {
              <article class="admin-row">
                <div class="admin-details">
                  <h3>{{recommendation.customerName}}</h3>
                  <p>{{recommendation.content}}</p>
                  <small>{{recommendation.published ? 'מוצגת באתר' : 'מוסתרת באתר'}} · {{recommendationScope(recommendation)}}</small>
                </div>
                <div class="admin-actions">
                  <button class="admin-action" type="button" (click)="editRecommendation(recommendation)">עריכה</button>
                  <button class="admin-action delete-action" type="button" (click)="removeRecommendation(recommendation.id)">מחיקה</button>
                </div>
              </article>
            }
          </div>
        </section>

        @if (editing) {
          <section class="editor">
            <h2>{{editing.id ? 'עריכת עסק' : 'עסק חדש'}}</h2>

            <form (ngSubmit)="save()">
              <div class="form-grid">
                <label>
                  שם העסק *
                  <input required [(ngModel)]="editing.name" name="name">
                </label>

                <label>
                  כתובת הקישור (באנגלית) *
                  <input required [(ngModel)]="editing.slug" name="slug" placeholder="my-business">
                </label>

                <label>
                  תחום העסק
                  <input [(ngModel)]="editing.category" name="category">
                </label>

                <label>
                  טלפון
                  <input [(ngModel)]="editing.phone" name="phone" type="tel">
                </label>

                <label>
                  כתובת מייל
                  <input [(ngModel)]="editing.email" name="email" type="email">
                </label>

                <label>
                  אתר אינטרנט
                  <input [(ngModel)]="editing.website" name="website" type="url" placeholder="https://example.co.il">
                </label>

                <label>
                  כתובת העסק
                  <input [(ngModel)]="editing.address" name="address">
                </label>

                <label>
                  שעות פעילות
                  <input [(ngModel)]="editing.hours" name="hours">
                </label>

                <label>
                  WhatsApp (מספר בינלאומי)
                  <input [(ngModel)]="editing.whatsapp" name="whatsapp" placeholder="9725XXXXXXXX">
                </label>

                <label>
                  תמונת כיסוי לעמוד העסק
                  <input [(ngModel)]="editing.imageUrl" name="imageUrl" placeholder="קישור לתמונה">
                </label>

                <label>
                  לוגו העסק
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" (change)="uploadBrandAsset($event, 'logo')">
                </label>

                @if (editing.logoUrl) {
                  <img class="brand-preview" [src]="editing.logoUrl" alt="תצוגה מקדימה של לוגו העסק">
                }

                <label>
                  Favicon – אייקון ללשונית הדפדפן
                  <input type="file" accept="image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml" (change)="uploadBrandAsset($event, 'favicon')">
                </label>

                @if (editing.faviconUrl) {
                  <img class="favicon-preview" [src]="editing.faviconUrl" alt="תצוגה מקדימה של favicon">
                }

                <label>
                  תמונות מוצרים או מקום העסק – ללא אנשים
                  <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple (change)="uploadImages($event)">
                </label>

                <small class="wide">
                  אפשר להעלות כמה תמונות. התמונות יוצגו בגלריה בעמוד העסק.
                </small>

                <label class="wide">
                  תיאור העסק
                  <textarea rows="3" [(ngModel)]="editing.description" name="description"></textarea>
                </label>

                <label class="check">
                  <input type="checkbox" [(ngModel)]="editing.published" name="published">
                  לפרסם את העמוד
                </label>

                <label class="check">
                  <input type="checkbox" [(ngModel)]="editing.showInExamples" name="showInExamples" [disabled]="!editing.published">
                  להציג את העסק באתר סמן
                </label>
                <label class="check">
                  <input type="checkbox" [(ngModel)]="editing.showRecommendations" name="showRecommendations">
                  להציג המלצות בעמוד העסק
                </label>
                <label class="check">
                  <input type="checkbox" [(ngModel)]="editing.sendVisitReportEmail" name="sendVisitReportEmail">
                  לשלוח למנהל העסק דוח יומי רק אם היו כניסות לעמוד
                </label>
              </div>

              <div class="actions">
                <button class="button" type="submit" [disabled]="busy">
                  {{busy ? 'שומרת…' : 'שמירת עסק'}}
                </button>
                <button class="button outline" type="button" (click)="editing = null">
                  ביטול
                </button>
              </div>
            </form>
          </section>
        }
      }
    </main>
  </div>
  `
})
export class AdminComponent {
  businesses: Business[] = [];
  editing: Business | null = null;
  loginEmail = '';
  loginPassword = '';
  loading = false;
  busy = false;
  error = '';
  cloudMode = false;
  loggedIn = false;
  localCount = 0;
  settings: SemanSettings = { sendVisitReportEmail: false, showRecommendationsSection: false };
  settingsError = '';
  recommendations: Recommendation[] = [];
  recommendationsError = '';
  recommendationDraft: Recommendation = this.emptyRecommendation();

  constructor(
    private service: BusinessService,
    private auth: AuthService
  ) {
    this.cloudMode = this.service.isCloudMode();
    this.localCount = this.service.getLocalCount();

    if (!this.cloudMode) {
      void this.refresh();
      return;
    }

    void this.checkSession();
  }

  private async checkSession(): Promise<void> {
    try {
      const { data, error } = await this.auth.getSession();
      const email = data.session?.user?.email?.toLowerCase();

      if (error || !data.session || email !== environment.ownerEmail.toLowerCase()) {
        await this.auth.logout();
        this.loggedIn = false;
        return;
      }

      this.loggedIn = true;
      await this.refresh();
      await this.loadAdminContent();
    } catch (e) {
      this.loggedIn = false;
      this.error = this.message(e);
    }
  }

  async refresh(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.businesses = await this.service.getAll();
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.loading = false;
    }
  }

  newBusiness(): void {
    this.error = '';
    this.editing = {
      id: '',
      slug: '',
      name: '',
      category: '',
      description: '',
      phone: '',
      email: '',
      website: '',
      address: '',
      hours: '',
      imageUrl: '',
      logoUrl: '',
      faviconUrl: '',
      galleryUrls: [],
      whatsapp: '',
      published: true,
      showInExamples: true,
      sendVisitReportEmail: false,
      showRecommendations: true
    };
  }

  edit(b: Business): void {
    this.error = '';
    this.editing = { ...b };
  }

  async save(): Promise<void> {
    if (!this.editing) return;

    this.busy = true;
    this.error = '';

    const rawSlug = (this.editing.slug || '').trim().toLowerCase();
    const slugSource = rawSlug || this.editing.name.trim().toLowerCase();

    const transliteration: Record<string, string> = {
      'א': 'a', 'ב': 'b', 'ג': 'g', 'ד': 'd', 'ה': 'h',
      'ו': 'v', 'ז': 'z', 'ח': 'ch', 'ט': 't', 'י': 'y',
      'כ': 'k', 'ך': 'k', 'ל': 'l', 'מ': 'm', 'ם': 'm',
      'נ': 'n', 'ן': 'n', 'ס': 's', 'ע': 'a', 'פ': 'p',
      'ף': 'f', 'צ': 'ts', 'ץ': 'ts', 'ק': 'k', 'ר': 'r',
      'ש': 'sh', 'ת': 't'
    };

    const normalizedSlug = Array.from(slugSource)
      .map(char => transliteration[char] ?? char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .replace(/-{2,}/g, '-');

    const slug = normalizedSlug || `business-${Date.now()}`;

    const duplicate = this.businesses.some(
      item => item.slug === slug && item.id !== this.editing?.id
    );

    if (duplicate) {
      this.error = 'כתובת הקישור הזו כבר קיימת. בחרי כתובת אחרת לעסק.';
      this.busy = false;
      return;
    }

    const value = {
      ...this.editing,
      id: this.editing.id || `local-${crypto.randomUUID()}`,
      slug
    };

    this.editing.slug = slug;

    try {
      await this.service.save(value);
      this.editing = null;
      await this.refresh();
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async toggleBusiness(business: Business, field: 'published' | 'showInExamples' | 'showRecommendations' | 'sendVisitReportEmail'): Promise<void> {
    const updated: Business = { ...business, [field]: !business[field] };
    if (field === 'published' && !updated.published) updated.showInExamples = false;
    this.busy = true;
    this.error = '';
    try {
      await this.service.save(updated);
      await this.refresh();
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('למחוק את העסק ואת העמוד הציבורי שלו?')) return;

    this.error = '';

    try {
      await this.service.delete(id);
      await this.refresh();
    } catch (e) {
      this.error = this.message(e);
    }
  }

  async login(): Promise<void> {
    this.busy = true;
    this.error = '';

    try {
      const { data, error } = await this.auth.login(
        this.loginEmail.trim(),
        this.loginPassword
      );

      if (error) {
        throw error;
      }

      if (
        !data.session ||
        !data.user ||
        data.user.email?.toLowerCase() !== environment.ownerEmail.toLowerCase()
      ) {
        await this.auth.logout();
        this.loggedIn = false;
        throw new Error('אין הרשאה להיכנס למערכת הניהול.');
      }

      this.loggedIn = true;
      this.loginPassword = '';
      await this.refresh();
      await this.loadAdminContent();
    } catch (e) {
      this.loggedIn = false;
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.loggedIn = false;
    this.businesses = [];
    this.editing = null;
  }

  private emptyRecommendation(): Recommendation {
    return { id: '', customerName: '', content: '', displayOrder: 0, published: true, businessId: '' };
  }

  private async loadAdminContent(): Promise<void> {
    try {
      this.settings = await this.service.getSettings();
      this.recommendations = await this.service.getRecommendations(true);
      this.settingsError = '';
      this.recommendationsError = '';
    } catch (e) {
      this.settingsError = this.message(e);
      this.recommendationsError = this.message(e);
    }
  }

  async saveSiteSettings(): Promise<void> {
    this.settingsError = '';
    try {
      await this.service.saveSettings(this.settings);
    } catch (e) {
      this.settingsError = this.message(e);
    }
  }

  async saveRecommendation(): Promise<void> {
    if (!this.recommendationDraft.customerName.trim() || !this.recommendationDraft.content.trim()) return;
    this.busy = true;
    this.recommendationsError = '';
    try {
      await this.service.saveRecommendation(this.recommendationDraft);
      this.resetRecommendationDraft();
      this.recommendations = await this.service.getRecommendations(true);
    } catch (e) {
      this.recommendationsError = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  recommendationScope(recommendation: Recommendation): string {
    if (!recommendation.businessId) return 'אתר סמן';
    return this.businesses.find(b => b.id === recommendation.businessId)?.name || 'עסק משויך';
  }

  editRecommendation(recommendation: Recommendation): void {
    this.recommendationDraft = { ...recommendation };
  }

  resetRecommendationDraft(): void {
    this.recommendationDraft = this.emptyRecommendation();
  }

  async removeBusinessRecommendations(business: Business): Promise<void> {
    const count = this.recommendations.filter(r => r.businessId === business.id).length;
    if (!count) { alert('לא נמצאו המלצות המשויכות לעסק הזה.'); return; }
    if (!confirm(`למחוק את כל ${count} ההמלצות של ${business.name}? הפעולה אינה הפיכה.`)) return;
    this.busy = true;
    this.recommendationsError = '';
    try {
      await this.service.deleteBusinessRecommendations(business.id);
      this.recommendations = await this.service.getRecommendations(true);
      if (this.recommendationDraft.businessId === business.id) this.resetRecommendationDraft();
    } catch (e) {
      this.recommendationsError = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async removeRecommendation(id: string): Promise<void> {
    if (!confirm('למחוק את ההמלצה?')) return;
    this.recommendationsError = '';
    try {
      await this.service.deleteRecommendation(id);
      this.recommendations = await this.service.getRecommendations(true);
    } catch (e) {
      this.recommendationsError = this.message(e);
    }
  }

  async migrateLocal(): Promise<void> {
    if (!confirm(`לייבא לענן ${this.localCount} עסקים שנשמרו בדפדפן הזה?`)) return;

    this.busy = true;
    this.error = '';

    try {
      await this.service.migrateLocalToCloud();
      this.localCount = 0;
      await this.refresh();
      alert('הנתונים הועברו לענן בהצלחה.');
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async uploadBrandAsset(event: Event, kind: 'logo' | 'favicon'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file || !this.editing) return;

    const allowed = kind === 'logo'
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
      : ['image/png', 'image/x-icon', 'image/vnd.microsoft.icon', 'image/svg+xml'];

    if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
      this.error = 'יש לבחור קובץ תמונה מתאים עד 2MB.';
      input.value = '';
      return;
    }

    this.busy = true;
    this.error = '';

    try {
      const url = await this.service.uploadImage(file);

      if (kind === 'logo') {
        this.editing.logoUrl = url;
      } else {
        this.editing.faviconUrl = url;
      }
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
      input.value = '';
    }
  }

  async uploadImages(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    if (!files.length || !this.editing) return;

    const invalid = files.find(file =>
      !( ['image/jpeg', 'image/png'].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name) ) ||
      file.size > 5 * 1024 * 1024
    );

    if (invalid) {
      this.error = 'יש לבחור תמונות JPG, JPEG או PNG עד 5MB לתמונה.';
      input.value = '';
      return;
    }

    this.busy = true;
    this.error = '';

    try {
      const urls: string[] = [];

      for (const file of files) {
        urls.push(await this.service.uploadImage(file));
      }

      this.editing.galleryUrls = [
        ...(this.editing.galleryUrls || []),
        ...urls
      ];

      if (!this.editing.imageUrl && urls.length) {
        this.editing.imageUrl = urls[0];
      }
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
      input.value = '';
    }
  }

  businessUrl(business: Business): string {
    return `${window.location.origin}/biz/${encodeURIComponent(business.slug)}`;
  }

  share(
    business: Business,
    channel: 'copy' | 'whatsapp' | 'sms' | 'email'
  ): void {
    const url = this.businessUrl(business);
    const text = `${business.name} – ${business.category}
טלפון: ${business.phone}
מייל: ${business.email}
אתר: ${business.website}
כתובת: ${business.address}
${url}`;

    const encoded = encodeURIComponent(text);

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener');
    } else if (channel === 'sms') {
      window.location.href = `sms:?body=${encoded}`;
    } else if (channel === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(business.name)}&body=${encoded}`;
    } else {
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(url).then(
          () => alert('הקישור הועתק.')
        );
      } else {
        window.prompt('העתיקי את הקישור:', url);
      }
    }
  }

  private message(error: unknown): string {
    return error instanceof Error
      ? error.message
      : 'אירעה שגיאה. נסי שוב.';
  }
}
