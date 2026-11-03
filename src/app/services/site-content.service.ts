import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {
  DEFAULT_CONTENT, DEFAULT_VISIBILITY, SECTION_KEYS, SiteContent, SiteContentRow, SiteVisibility,
  SectionKey, mergeSection, sectionDef
} from '../models/site-content.model';

const CACHE_KEY = 'seman-site-content-v1';
const LOAD_TIMEOUT_MS = 4000;

/**
 * גישה לתוכן האתר שנערך במסך הניהול.
 * - לציבור: קריאה בלבד (RLS מאפשר SELECT לכולם). תמיד יש נפילה חזרה לטקסטים המקוריים,
 *   כך שהאתר עובד גם אם Supabase לא זמין.
 * - למנהלת: שמירה, הסתרה, שחזור מקור וחזרה לגרסה הקודמת (RLS מאפשר כתיבה לבעלים בלבד).
 */
@Injectable({ providedIn: 'root' })
export class SiteContentService {
  content: SiteContent = this.build([]).content;
  visibility: SiteVisibility = { ...DEFAULT_VISIBILITY };
  /** true כשיש מה להציג (מהמטמון המקומי או מהשרת, או אחרי כשל שחוזר לברירות מחדל) */
  ready = false;
  private loading?: Promise<void>;
  private readonly configured = environment.supabaseUrl.startsWith('https://') && !environment.supabaseUrl.includes('YOUR_PROJECT_ID') && !environment.supabaseAnonKey.includes('YOUR_SUPABASE');

  constructor(private auth: AuthService) {
    const cached = this.readCache();
    if (cached) { this.apply(cached); this.ready = true; }
  }

  /** טוען מהשרת (פעם אחת בכל טעינת אפליקציה, אלא אם force). לעולם לא נכשל. */
  load(force = false): Promise<void> {
    if (!this.loading || force) {
      this.loading = this.fetchRows().then(rows => {
        this.apply(rows);
        this.writeCache(rows);
      }).catch(error => {
        console.error('Could not load site content, using saved/default text', error);
      }).finally(() => { this.ready = true; });
    }
    return this.loading;
  }

  // ----- פעולות מנהלת -------------------------------------------------------

  async getRows(): Promise<SiteContentRow[]> {
    this.requireCloud();
    return this.request<SiteContentRow[]>('/rest/v1/seman_site_content?select=*');
  }

  /** שומר את השינויים של אזור, ושומר את מה שהיה עד עכשיו כ"גרסה קודמת". */
  async saveSection(key: SectionKey, content: Record<string, unknown>, previous: Record<string, unknown>): Promise<void> {
    await this.upsert({ section_key: key, content, previous_content: previous, updated_at: new Date().toISOString() });
  }

  /** מחזיר את הטקסט המקורי של האזור. הגרסה שהייתה נשמרת, כך שאפשר לבטל גם את השחזור. */
  async restoreOriginal(key: SectionKey, current: Record<string, unknown>): Promise<void> {
    await this.upsert({ section_key: key, content: {}, previous_content: current, updated_at: new Date().toISOString() });
  }

  /** מחליף בין הגרסה הנוכחית לקודמת. */
  async swapWithPrevious(key: SectionKey, current: Record<string, unknown>, previous: Record<string, unknown>): Promise<void> {
    await this.upsert({ section_key: key, content: previous, previous_content: current, updated_at: new Date().toISOString() });
  }

  async setVisible(key: SectionKey, visible: boolean): Promise<void> {
    if (!sectionDef(key).canHide) throw new Error('אזור זה אינו ניתן להסתרה.');
    await this.upsert({ section_key: key, visible, updated_at: new Date().toISOString() });
  }

  // ----- פנימי ---------------------------------------------------------------

  private async upsert(row: Record<string, unknown>): Promise<void> {
    this.requireCloud();
    await this.request('/rest/v1/seman_site_content?on_conflict=section_key', {
      method: 'POST',
      body: JSON.stringify(row),
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }
    });
    await this.load(true);
  }

  private requireCloud(): void {
    if (!this.configured) throw new Error('עריכת תוכן האתר זמינה לאחר חיבור Supabase.');
  }

  private async fetchRows(): Promise<SiteContentRow[]> {
    if (!this.configured) return [];
    return this.request<SiteContentRow[]>('/rest/v1/seman_site_content?select=section_key,content,visible', { signal: AbortSignal.timeout(LOAD_TIMEOUT_MS) });
  }

  private build(rows: Pick<SiteContentRow, 'section_key' | 'content' | 'visible'>[]): { content: SiteContent; visibility: SiteVisibility } {
    const byKey = new Map(rows.map(row => [row.section_key, row]));
    const content = {} as Record<string, unknown>;
    const visibility = { ...DEFAULT_VISIBILITY };
    for (const key of SECTION_KEYS) {
      const row = byKey.get(key);
      content[key] = mergeSection(key, row?.content);
      // אזורים שאינם ניתנים להסתרה (כותרת עליונה, עמוד ראשי) תמיד מוצגים.
      // "המלצות" נשלט על ידי המתג הקיים seman_settings.show_recommendations_section.
      visibility[key] = !sectionDef(key).canHide || key === 'recommendations' ? true : row?.visible !== false;
    }
    return { content: content as unknown as SiteContent, visibility };
  }

  private apply(rows: Pick<SiteContentRow, 'section_key' | 'content' | 'visible'>[]): void {
    const built = this.build(rows);
    this.content = built.content;
    this.visibility = built.visibility;
  }

  private readCache(): SiteContentRow[] | null {
    try {
      const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
      return Array.isArray(parsed) ? parsed : null;
    } catch { return null; }
  }

  private writeCache(rows: SiteContentRow[]): void {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(rows.map(({ section_key, content, visible }) => ({ section_key, content, visible }))));
    } catch { /* אחסון מקומי חסום או מלא: לא קריטי */ }
  }

  private async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('apikey', environment.supabaseAnonKey);
    const { data } = await this.auth.getSession();
    const token = data.session?.access_token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    const response = await fetch(`${environment.supabaseUrl}${path}`, { ...options, headers, cache: options.method ? undefined : 'no-store' });
    if (!response.ok) throw new Error(await this.errorMessage(response));
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    return text ? JSON.parse(text) as T : undefined as T;
  }

  private async errorMessage(response: Response): Promise<string> {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body);
      const message: string = parsed.message || parsed.msg || parsed.error_description || body;
      if (/seman_site_content/.test(message) && /(does not exist|schema cache)/i.test(message)) {
        return 'טבלת תוכן האתר עדיין לא נוצרה. יש להריץ ב-Supabase את הקובץ 202611040001_site_content.sql.';
      }
      return message;
    } catch { return body || `שגיאת שרת (${response.status})`; }
  }
}
