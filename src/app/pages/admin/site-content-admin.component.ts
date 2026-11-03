import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BusinessService } from '../../services/business.service';
import { SiteContentService } from '../../services/site-content.service';
import {
  FieldDef, ListDef, SECTION_DEFS, SectionDef, SectionKey, SiteContentRow,
  diffFromDefaults, draftFor, validateDraft
} from '../../models/site-content.model';

/**
 * "עריכת תוכן אתר סמן": רשימת אזורי האתר, ולחיצה על אזור פותחת טופס עם כל הטקסטים שלו.
 * הטופס נבנה מהסכמה ב-site-content.model.ts, כך שהוספת שדה חדש דורשת שינוי במקום אחד בלבד.
 */
@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'app-site-content-admin',
  template: `
  <section class="editor cms">
    @if (!selected) {
      <h2>עריכת תוכן אתר סמן</h2>
      <p>בחרי אזור באתר כדי לערוך את הטקסטים שלו. אפשר גם להסתיר אזור בלי למחוק אותו. שינויים נשמרים בענן ומופיעים באתר בכניסה או ברענון הבא, בלי פריסה מחדש.</p>
      @if (success) { <div class="notice cms-success" role="status">{{success}}</div> }
      @if (error) { <div class="notice warning" role="alert">{{error}}</div> }
      @if (loading) { <p>טוענת אזורים…</p> }
      <div class="admin-list">
        @for (section of sections; track section.key) {
          <article class="admin-row cms-row">
            <div class="admin-details">
              <h3>{{section.title}}</h3>
              <p>{{section.summary}}</p>
            </div>
            <span class="status" [class.off]="!isVisible(section)">{{statusLabel(section)}}</span>
            <div class="admin-actions">
              <button class="admin-action edit-action" type="button" (click)="open(section)" [disabled]="busy">
                <span aria-hidden="true">✎</span> עריכת טקסטים
              </button>
              @if (section.canHide) {
                <button class="admin-action" type="button" (click)="toggleVisible(section)" [disabled]="busy">
                  {{isVisible(section) ? 'הסתרה מהאתר' : 'הצגה באתר'}}
                </button>
              }
              @if (hasChanges(section.key)) {
                <button class="admin-action delete-action" type="button" (click)="restoreFromList(section)" [disabled]="busy">שחזור הטקסט המקורי</button>
              }
            </div>
          </article>
        }
      </div>
      <p class="hint"><a href="/" target="_blank" rel="noopener">פתיחת האתר בלשונית חדשה ↗</a></p>
    } @else {
      <div class="cms-editor-head">
        <button class="text-button" type="button" (click)="back()">→ חזרה לרשימת האזורים</button>
        <a class="text-button" href="/" target="_blank" rel="noopener">פתיחת האתר ↗</a>
      </div>
      <h2>{{selected.title}}</h2>
      <p class="hint">{{selected.summary}}. שדה שיישאר ריק לא יוצג באתר.</p>
      @if (selected.note) { <div class="notice">{{selected.note}}</div> }
      @if (error) { <div class="notice warning" role="alert">{{error}}</div> }
      @if (success) { <div class="notice cms-success" role="status">{{success}}</div> }

      <form (ngSubmit)="save()">
        @if (selected.fields.length) {
          <div class="form-grid">
            @for (field of selected.fields; track field.key) {
              <label [class.wide]="field.type === 'textarea'">
                {{field.label}}@if (field.required) { * }
                @if (field.type === 'textarea') {
                  <textarea rows="3" [attr.maxlength]="field.max" [(ngModel)]="draft[field.key]" [name]="'field-' + field.key"></textarea>
                } @else {
                  <input [type]="inputType(field)" [attr.dir]="isLtr(field) ? 'ltr' : null" [attr.maxlength]="field.max"
                         [(ngModel)]="draft[field.key]" [name]="'field-' + field.key">
                }
              </label>
            }
          </div>
        }

        @for (list of selected.lists; track list.key) {
          <fieldset class="cms-list">
            <legend>{{list.label}}</legend>
            @for (item of listItems(list); track $index; let i = $index) {
              <div class="cms-item">
                <div class="cms-item-head">
                  <strong>{{list.itemLabel}} {{i + 1}}</strong>
                  <span class="cms-item-actions">
                    <button type="button" class="admin-action" (click)="moveItem(list, i, -1)" [disabled]="i === 0" aria-label="העברה למעלה">↑</button>
                    <button type="button" class="admin-action" (click)="moveItem(list, i, 1)" [disabled]="i === listItems(list).length - 1" aria-label="העברה למטה">↓</button>
                    <button type="button" class="admin-action delete-action" (click)="removeItem(list, i)" [disabled]="listItems(list).length <= list.min">הסרה</button>
                  </span>
                </div>
                <div class="form-grid">
                  @for (field of list.fields; track field.key) {
                    <label [class.wide]="field.type === 'textarea'">
                      {{field.label}}
                      @if (field.type === 'textarea') {
                        <textarea rows="2" [attr.maxlength]="field.max" [(ngModel)]="item[field.key]" [name]="list.key + '-' + i + '-' + field.key"></textarea>
                      } @else {
                        <input [type]="inputType(field)" [attr.dir]="isLtr(field) ? 'ltr' : null" [attr.maxlength]="field.max"
                               [(ngModel)]="item[field.key]" [name]="list.key + '-' + i + '-' + field.key">
                      }
                    </label>
                  }
                </div>
              </div>
            }
            <button type="button" class="button outline small" (click)="addItem(list)" [disabled]="listItems(list).length >= list.max">
              + הוספת {{list.itemLabel}}
            </button>
            <small class="hint">עד {{list.max}} פריטים.</small>
          </fieldset>
        }

        <div class="actions cms-actions">
          <button class="button" type="submit" [disabled]="busy || !dirty">{{busy ? 'שומרת…' : 'שמירת שינויים'}}</button>
          <button class="button outline" type="button" (click)="discard()" [disabled]="busy || !dirty">ביטול השינויים שלא נשמרו</button>
          @if (hasPrevious(selected.key)) {
            <button class="button outline" type="button" (click)="revertPrevious()" [disabled]="busy">חזרה לגרסה הקודמת</button>
          }
          @if (hasChanges(selected.key)) {
            <button class="button outline danger" type="button" (click)="restoreOriginal()" [disabled]="busy">שחזור הטקסט המקורי</button>
          }
        </div>
        @if (dirty) { <p class="hint cms-dirty">יש שינויים שעדיין לא נשמרו.</p> }
      </form>
    }
  </section>
  `
})
export class SiteContentAdminComponent implements OnInit {
  readonly sections = SECTION_DEFS;
  rows = new Map<SectionKey, SiteContentRow>();
  recommendationsVisible = false;
  loading = true;
  busy = false;
  error = '';
  success = '';
  selected: SectionDef | null = null;
  draft: Record<string, any> = {};
  private snapshot = '';

  constructor(private site: SiteContentService, private business: BusinessService) {}

  ngOnInit(): void { void this.reload(); }

  get dirty(): boolean { return !!this.selected && JSON.stringify(this.draft) !== this.snapshot; }

  async reload(): Promise<void> {
    this.loading = true;
    try {
      const rows = await this.site.getRows();
      this.rows = new Map((rows || []).map(row => [row.section_key, row]));
      this.recommendationsVisible = (await this.business.getSettings()).showRecommendationsSection;
      this.error = '';
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.loading = false;
    }
  }

  isVisible(section: SectionDef): boolean {
    if (!section.canHide) return true;
    if (section.key === 'recommendations') return this.recommendationsVisible;
    return this.rows.get(section.key)?.visible !== false;
  }

  statusLabel(section: SectionDef): string {
    if (!section.canHide) return 'תמיד מוצג';
    return this.isVisible(section) ? 'מוצג באתר' : 'מוסתר מהאתר';
  }

  hasChanges(key: SectionKey): boolean {
    const content = this.rows.get(key)?.content;
    return !!content && Object.keys(content).length > 0;
  }

  hasPrevious(key: SectionKey): boolean { return this.rows.get(key)?.previous_content != null; }

  async toggleVisible(section: SectionDef): Promise<void> {
    this.busy = true; this.error = ''; this.success = '';
    try {
      const next = !this.isVisible(section);
      if (section.key === 'recommendations') {
        // אזור ההמלצות נשלט על ידי הגדרת האתר הקיימת, כדי שיהיה מתג אחד בלבד.
        const settings = await this.business.getSettings();
        await this.business.saveSettings({ ...settings, showRecommendationsSection: next });
      } else {
        await this.site.setVisible(section.key, next);
      }
      await this.reload();
      this.success = next ? `האזור "${section.title}" מוצג באתר.` : `האזור "${section.title}" הוסתר מהאתר. התוכן שלו נשמר ואפשר להחזיר אותו בכל רגע.`;
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  open(section: SectionDef): void {
    this.error = ''; this.success = '';
    this.selected = section;
    this.resetDraft();
  }

  back(): void {
    if (this.dirty && !confirm('יש שינויים שלא נשמרו. לצאת בלי לשמור?')) return;
    this.selected = null;
    this.error = ''; this.success = '';
  }

  discard(): void { this.resetDraft(); this.error = ''; this.success = ''; }

  async save(): Promise<void> {
    const section = this.selected;
    if (!section || !this.dirty) return;
    const result = validateDraft(section.key, this.draft);
    if (!result.ok) { this.error = result.error; this.success = ''; return; }

    this.busy = true; this.error = ''; this.success = '';
    try {
      const current = this.rows.get(section.key)?.content || {};
      await this.site.saveSection(section.key, diffFromDefaults(section.key, result.cleaned), current);
      await this.reload();
      this.resetDraft();
      this.success = 'השינויים נשמרו, והם כבר באתר. מי שפותח את האתר רואה אותם מיד, ובדף שכבר פתוח אצלו אחרי רענון.';
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  async restoreOriginal(): Promise<void> {
    const section = this.selected;
    if (!section) return;
    if (!confirm(`לשחזר את הטקסט המקורי של "${section.title}"? כל העריכות באזור הזה יוסרו (אפשר לבטל בעזרת "חזרה לגרסה הקודמת").`)) return;
    await this.runRestore(section);
    this.resetDraft();
  }

  async restoreFromList(section: SectionDef): Promise<void> {
    if (!confirm(`לשחזר את הטקסט המקורי של "${section.title}"? כל העריכות באזור הזה יוסרו.`)) return;
    await this.runRestore(section);
  }

  async revertPrevious(): Promise<void> {
    const section = this.selected;
    const row = section ? this.rows.get(section.key) : undefined;
    if (!section || !row || row.previous_content == null) return;
    if (this.dirty && !confirm('יש שינויים שלא נשמרו והם יימחקו. להמשיך?')) return;
    if (!confirm('לחזור לגרסה שהייתה לפני השמירה האחרונה?')) return;
    this.busy = true; this.error = ''; this.success = '';
    try {
      await this.site.swapWithPrevious(section.key, row.content || {}, row.previous_content);
      await this.reload();
      this.resetDraft();
      this.success = 'חזרת לגרסה הקודמת. אפשר ללחוץ שוב כדי לחזור לגרסה האחרונה.';
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  // ----- רשימות ---------------------------------------------------------------

  listItems(list: ListDef): Record<string, string>[] { return (this.draft[list.key] as Record<string, string>[]) || []; }

  addItem(list: ListDef): void {
    const items = this.listItems(list);
    if (items.length >= list.max) return;
    const blank: Record<string, string> = {};
    for (const field of list.fields) blank[field.key] = '';
    this.draft[list.key] = [...items, blank];
  }

  removeItem(list: ListDef, index: number): void {
    const items = this.listItems(list);
    if (items.length <= list.min) return;
    this.draft[list.key] = items.filter((_, i) => i !== index);
  }

  moveItem(list: ListDef, index: number, direction: -1 | 1): void {
    const items = [...this.listItems(list)];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    this.draft[list.key] = items;
  }

  inputType(field: FieldDef): string {
    return field.type === 'email' ? 'email' : field.type === 'phone' ? 'tel' : 'text';
  }

  isLtr(field: FieldDef): boolean {
    return field.type === 'email' || field.type === 'phone' || field.type === 'whatsapp' || field.type === 'link';
  }

  // ----- פנימי ----------------------------------------------------------------

  private async runRestore(section: SectionDef): Promise<void> {
    this.busy = true; this.error = ''; this.success = '';
    try {
      await this.site.restoreOriginal(section.key, this.rows.get(section.key)?.content || {});
      await this.reload();
      this.success = `הטקסט המקורי של "${section.title}" שוחזר.`;
    } catch (e) {
      this.error = this.message(e);
    } finally {
      this.busy = false;
    }
  }

  private resetDraft(): void {
    if (!this.selected) return;
    this.draft = draftFor(this.selected.key, this.rows.get(this.selected.key)?.content);
    this.snapshot = JSON.stringify(this.draft);
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'אירעה שגיאה. נסי שוב.';
  }
}
