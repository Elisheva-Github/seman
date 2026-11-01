import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Business } from '../../models/business.model';
import { BusinessService } from '../../services/business.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink],
  selector: 'app-admin',
  template: `
  <div class="admin-shell">
    <header class="admin-header"><a class="brand" routerLink="/"><span class="pin-mark" aria-hidden="true"></span> סמן</a><span>מערכת ניהול עסקים</span><div class="header-actions"><a routerLink="/">חזרה לאתר ←</a>@if (cloudMode && loggedIn) { <button class="text-button" (click)="logout()">התנתקות</button> }</div></header>
    <main class="admin-main">
      @if (cloudMode && !loggedIn) {
        <section class="login-card">
          <span class="eyebrow">ניהול מאובטח</span><h1>כניסה למערכת סמן</h1><p>התחברי עם משתמש מנהלת שיצרת בפרויקט Supabase.</p>
          <form (ngSubmit)="login()"><label>כתובת מייל<input type="email" required [(ngModel)]="loginEmail" name="loginEmail" autocomplete="username"></label><label>סיסמה<input type="password" required [(ngModel)]="loginPassword" name="loginPassword" autocomplete="current-password"></label><button class="button" type="submit" [disabled]="busy">{{busy ? 'מתחברת…' : 'כניסה למערכת'}}</button></form>
          @if (error) { <p class="form-error">{{error}}</p> }
        </section>
      } @else {
        <div class="admin-title"><div><span class="eyebrow">אזור ניהול</span><h1>העסקים שלי</h1><p>מכאן יוצרים עמודים חדשים ומנהלים את כל לקוחות סמן.</p></div><button class="button" (click)="newBusiness()">+ הוספת עסק חדש</button></div>
        @if (!cloudMode) { <div class="notice warning">המערכת עדיין במצב מקומי. הנתונים נשמרים בדפדפן הזה בלבד. כדי להעביר אותם לענן, הגדירי Supabase לפי קובץ SETUP-CLOUD.md.</div> }
        @if (cloudMode && localCount > 0) { <div class="notice">נמצאו {{localCount}} עסקים שנשמרו בעבר בדפדפן הזה. <button class="button outline small" (click)="migrateLocal()" [disabled]="busy">ייבוא הנתונים לענן</button></div> }
        @if (error) { <div class="notice warning">{{error}}</div> }
        @if (loading) { <p>טוענת עסקים…</p> } @else if (!businesses.length) { <div class="empty-state">עדיין אין עסקים. לחצי על „הוספת עסק חדש” כדי ליצור את העמוד הראשון.</div> }
        <div class="admin-list">
          @for (business of businesses; track business.id) {
            <article class="admin-row">
              <div class="admin-avatar"><span class="pin-mark"></span></div>
              <div class="admin-details"><h3>{{business.name}}</h3><p>{{business.category}} · {{business.address}}</p><a [routerLink]="['/biz', business.slug]" target="_blank">פתיחת העמוד הציבורי ↗</a></div>
              <span class="status" [class.off]="!business.published">{{business.published ? 'מפורסם' : 'טיוטה'}}</span>
              <button class="button outline small" (click)="share(business, 'copy')">העתקת קישור</button><button class="button outline small" (click)="share(business, 'whatsapp')">WhatsApp</button><button class="button outline small" (click)="share(business, 'sms')">SMS</button><button class="button outline small" (click)="share(business, 'email')">מייל</button><button class="button outline small" (click)="edit(business)">עריכה</button><button class="delete" (click)="remove(business.id)">מחיקה</button>
            </article>
          }
        </div>
        @if (editing) {
          <section class="editor">
            <h2>{{editing.id ? 'עריכת עסק' : 'עסק חדש'}}</h2>
            <form (ngSubmit)="save()">
              <div class="form-grid">
                <label>שם העסק *<input required [(ngModel)]="editing.name" name="name"></label>
                <label>כתובת הקישור (באנגלית) *<input required [(ngModel)]="editing.slug" name="slug" placeholder="my-business"></label>
                <label>תחום העסק<input [(ngModel)]="editing.category" name="category"></label>
                <label>טלפון<input [(ngModel)]="editing.phone" name="phone" type="tel"></label>
                <label>כתובת מייל<input [(ngModel)]="editing.email" name="email" type="email"></label>
                <label>אתר אינטרנט<input [(ngModel)]="editing.website" name="website" type="url" placeholder="https://example.co.il"></label>
                <label>כתובת העסק<input [(ngModel)]="editing.address" name="address"></label>
                <label>שעות פעילות<input [(ngModel)]="editing.hours" name="hours"></label>
                <label>WhatsApp (מספר בינלאומי)<input [(ngModel)]="editing.whatsapp" name="whatsapp" placeholder="9725XXXXXXXX"></label>
                <label>תמונת מוצר או מקום – ללא אנשים<input [(ngModel)]="editing.imageUrl" name="imageUrl" placeholder="קישור לתמונה"></label>
                <label>או העלאת תמונה מהמחשב<input type="file" accept="image/*" (change)="uploadImage($event)"></label>
                <label class="wide">תיאור העסק<textarea rows="3" [(ngModel)]="editing.description" name="description"></textarea></label>
                <label class="check"><input type="checkbox" [(ngModel)]="editing.published" name="published"> לפרסם את העמוד</label>
              </div>
              <div class="actions"><button class="button" type="submit" [disabled]="busy">{{busy ? 'שומרת…' : 'שמירת עסק'}}</button><button class="button outline" type="button" (click)="editing = null">ביטול</button></div>
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

  constructor(private service: BusinessService, private auth: AuthService) {
    this.cloudMode = this.service.isCloudMode();
    this.loggedIn = this.auth.isLoggedIn();
    this.localCount = this.service.getLocalCount();
    if (!this.cloudMode || this.loggedIn) void this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading = true; this.error = '';
    try { this.businesses = await this.service.getAll(); }
    catch (e) { this.error = this.message(e); }
    finally { this.loading = false; }
  }

  newBusiness(): void {
    this.error = '';
    this.editing = { id: '', slug: '', name: '', category: '', description: '', phone: '', email: '', website: '', address: '', hours: '', imageUrl: '', whatsapp: '', published: true };
  }
  edit(b: Business): void { this.error = ''; this.editing = { ...b }; }

  async save(): Promise<void> {
    if (!this.editing) return;
    this.busy = true; this.error = '';
    const value = { ...this.editing, id: this.editing.id || `local-${crypto.randomUUID()}`, slug: this.editing.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '') };
    try {
      await this.service.save(value);
      this.editing = null;
      await this.refresh();
    } catch (e) { this.error = this.message(e); }
    finally { this.busy = false; }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('למחוק את העסק ואת העמוד הציבורי שלו?')) return;
    this.error = '';
    try { await this.service.delete(id); await this.refresh(); }
    catch (e) { this.error = this.message(e); }
  }

  async login(): Promise<void> {
    this.busy = true; this.error = '';
    try { await this.auth.signIn(this.loginEmail, this.loginPassword); this.loggedIn = true; await this.refresh(); }
    catch (e) { this.error = this.message(e); }
    finally { this.busy = false; }
  }

  logout(): void { this.auth.signOut(); this.loggedIn = false; this.businesses = []; this.editing = null; }

  async migrateLocal(): Promise<void> {
    if (!confirm(`לייבא לענן ${this.localCount} עסקים שנשמרו בדפדפן הזה?`)) return;
    this.busy = true; this.error = '';
    try { await this.service.migrateLocalToCloud(); this.localCount = 0; await this.refresh(); alert('הנתונים הועברו לענן בהצלחה.'); }
    catch (e) { this.error = this.message(e); }
    finally { this.busy = false; }
  }

  async uploadImage(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.editing) return;
    if (!file.type.startsWith('image/')) { this.error = 'אפשר להעלות קובצי תמונה בלבד.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.error = 'גודל התמונה המרבי הוא 5MB.'; return; }
    this.busy = true; this.error = '';
    try { this.editing.imageUrl = await this.service.uploadImage(file); }
    catch (e) { this.error = this.message(e); }
    finally { this.busy = false; }
  }

  share(business: Business, channel: 'copy' | 'whatsapp' | 'sms' | 'email'): void {
    const url = `${window.location.origin}/biz/${business.slug}`;
    const text = `${business.name} – ${business.category}\nטלפון: ${business.phone}\nמייל: ${business.email}\nאתר: ${business.website}\nכתובת: ${business.address}\n${url}`;
    const encoded = encodeURIComponent(text);
    if (channel === 'whatsapp') window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener');
    else if (channel === 'sms') window.location.href = `sms:?body=${encoded}`;
    else if (channel === 'email') window.location.href = `mailto:?subject=${encodeURIComponent(business.name)}&body=${encoded}`;
    else {
      if (navigator.clipboard?.writeText) void navigator.clipboard.writeText(url).then(() => alert('הקישור הועתק.'));
      else { window.prompt('העתיקי את הקישור:', url); }
    }
  }

  private message(error: unknown): string { return error instanceof Error ? error.message : 'אירעה שגיאה. נסי שוב.'; }
}
