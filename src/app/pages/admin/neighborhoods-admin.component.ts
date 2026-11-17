import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Business } from '../../models/business.model';
import { Neighborhood } from '../../models/neighborhood.model';
import { BusinessService } from '../../services/business.service';
import { NeighborhoodService } from '../../services/neighborhood.service';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** ניהול שכונות: הוספה, עריכה, לוגו שכונה, פרסום ומחיקה. שיוך עסק לשכונה נעשה בטופס העסק. */
@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-neighborhoods-admin',
  template: `
  <section class="editor cms">
    @if (!editing) {
      <h2>שכונות</h2>
      <p>כל שכונה מקבלת דף משלה עם ריבועים של העסקים ששויכו אליה וסינון לפי קטגוריה. שיוך עסק לשכונה נעשה בטופס העסק, בלשונית "ניהול עסקים".</p>
      @if (success) { <div class="notice cms-success" role="status">{{success}}</div> }
      @if (error) { <div class="notice warning" role="alert">{{error}}</div> }
      <div class="actions"><button class="button" type="button" (click)="create()">+ הוספת שכונה</button></div>
      @if (loading) { <p>טוענת שכונות…</p> }
      @else if (!neighborhoods.length && !error) { <p class="hint">עדיין לא נוספו שכונות.</p> }
      <div class="admin-list">
        @for (n of neighborhoods; track n.id) {
          <article class="admin-row cms-row">
            @if (n.logoUrl) { <img class="brand-preview nb-admin-logo" [src]="n.logoUrl" [alt]="'לוגו שכונת ' + n.name"> }
            <div class="admin-details">
              <h3>{{n.name}}</h3>
              <p dir="ltr" class="nb-admin-link">{{pagePath(n)}}</p>
              <p>{{countFor(n)}} עסקים משויכים</p>
            </div>
            <span class="status" [class.off]="!n.published">{{n.published ? 'מפורסמת' : 'לא מפורסמת'}}</span>
            <div class="admin-actions">
              <button class="admin-action edit-action" type="button" (click)="edit(n)">עריכה</button>
              <a class="admin-action" [href]="pagePath(n)" target="_blank" rel="noopener">צפייה בדף ↗</a>
              <button class="admin-action" type="button" (click)="copyLink(n)">העתקת קישור</button>
              <button class="admin-action delete-action" type="button" (click)="remove(n)" [disabled]="busy">מחיקה</button>
            </div>
          </article>
        }
      </div>
    } @else {
      <div class="cms-editor-head"><button class="text-button" type="button" (click)="cancel()">→ חזרה לרשימת השכונות</button></div>
      <h2>{{editing.id ? 'עריכת שכונה' : 'שכונה חדשה'}}</h2>
      @if (error) { <div class="notice warning" role="alert">{{error}}</div> }
      <form (ngSubmit)="save()">
        <div class="form-grid">
          <label>שם השכונה *
            <input required maxlength="120" [(ngModel)]="editing.name" name="nbName" placeholder="נווה יעקב">
          </label>
          <label>כתובת הקישור (באנגלית) *
            <input required maxlength="80" dir="ltr" [(ngModel)]="editing.slug" name="nbSlug" placeholder="neve-yaakov">
            <small>אותיות קטנות באנגלית, ספרות ומקפים בלבד. הדף יהיה בכתובת /n/{{editing.slug || '…'}}</small>
          </label>
          <label class="wide">טקסט קצר על השכונה (אופציונלי)
            <textarea rows="3" maxlength="1000" [(ngModel)]="editing.description" name="nbDescription" placeholder="כל העסקים של השכונה במקום אחד"></textarea>
          </label>
          <label>לוגו השכונה (אופציונלי)
            <input type="file" accept="image/png,image/jpeg,image/webp" (change)="uploadLogo($event)" [disabled]="uploading">
            <small>JPG, PNG או WEBP, עד 2MB. אם אין לוגו, יוצג סמן מיקום.</small>
          </label>
          @if (editing.logoUrl) {
            <div class="nb-logo-edit">
              <img class="brand-preview" [src]="editing.logoUrl" alt="תצוגה מקדימה של לוגו השכונה">
              <button type="button" class="admin-action delete-action" (click)="editing.logoUrl = ''">הסרת הלוגו</button>
            </div>
          }
          <label class="check wide">
            <input type="checkbox" [(ngModel)]="editing.published" name="nbPublished">
            לפרסם את דף השכונה באתר
          </label>
        </div>
        <div class="actions cms-actions">
          <button class="button" type="submit" [disabled]="busy || uploading">{{busy ? 'שומרת…' : 'שמירת שכונה'}}</button>
          <button class="button outline" type="button" (click)="cancel()" [disabled]="busy">ביטול</button>
        </div>
      </form>
    }
  </section>
  `
})
export class NeighborhoodsAdminComponent implements OnInit {
  neighborhoods: Neighborhood[] = [];
  businesses: Business[] = [];
  editing: Neighborhood | null = null;
  loading = true;
  busy = false;
  uploading = false;
  error = '';
  success = '';

  constructor(private service: NeighborhoodService, private businessService: BusinessService) {}

  ngOnInit(): void { void this.reload(); }

  async reload(): Promise<void> {
    this.loading = true;
    try {
      this.neighborhoods = await this.service.getAll();
      this.businesses = await this.businessService.getAll();
      this.error = '';
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.loading = false;
    }
  }

  countFor(n: Neighborhood): number { return this.businesses.filter(b => b.neighborhoodId === n.id).length; }
  pagePath(n: Neighborhood): string { return `/n/${n.slug}`; }

  create(): void { this.error = ''; this.success = ''; this.editing = { id: '', slug: '', name: '', description: '', logoUrl: '', published: true }; }
  edit(n: Neighborhood): void { this.error = ''; this.success = ''; this.editing = { ...n }; }
  cancel(): void { this.editing = null; this.error = ''; }

  async save(): Promise<void> {
    const n = this.editing;
    if (!n) return;
    n.name = n.name.trim();
    n.slug = n.slug.trim().toLowerCase();
    if (!n.name) { this.error = 'יש להזין שם שכונה.'; return; }
    if (!SLUG_PATTERN.test(n.slug)) { this.error = 'כתובת הקישור חייבת להכיל אותיות קטנות באנגלית, ספרות ומקפים בלבד (למשל neve-yaakov).'; return; }
    this.busy = true; this.error = ''; this.success = '';
    try {
      await this.service.save(n);
      this.editing = null;
      await this.reload();
      this.success = 'השכונה נשמרה.';
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async remove(n: Neighborhood): Promise<void> {
    const count = this.countFor(n);
    const extra = count ? ` ${count} עסקים משויכים אליה יישארו באתר, רק בלי שיוך לשכונה.` : '';
    if (!confirm(`למחוק את השכונה "${n.name}"?${extra}`)) return;
    this.busy = true; this.error = ''; this.success = '';
    try {
      await this.service.delete(n.id);
      await this.reload();
      this.success = 'השכונה נמחקה.';
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async copyLink(n: Neighborhood): Promise<void> {
    const url = `${window.location.origin}${this.pagePath(n)}`;
    try { await navigator.clipboard.writeText(url); this.success = 'הקישור הועתק.'; this.error = ''; }
    catch { window.prompt('העתיקי את הקישור:', url); }
  }

  async uploadLogo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editing) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      this.error = 'הלוגו חייב להיות קובץ JPG, PNG או WEBP, עד 2MB.';
      input.value = '';
      return;
    }
    this.uploading = true; this.error = '';
    try { this.editing.logoUrl = await this.businessService.uploadImage(file); }
    catch (e) { this.error = this.message(e); }
    finally { this.uploading = false; input.value = ''; }
  }

  private message(error: unknown): string { return error instanceof Error ? error.message : 'אירעה שגיאה. נסי שוב.'; }
}
