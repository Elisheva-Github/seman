import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Neighborhood } from '../models/neighborhood.model';
import { AuthService } from './auth.service';

/** שכונות: קריאה ציבורית לדפי שכונה, וניהול (RLS: כתיבה לבעלת סמן בלבד). */
@Injectable({ providedIn: 'root' })
export class NeighborhoodService {
  private readonly storageKey = 'seman-neighborhoods';
  private readonly configured = environment.supabaseUrl.startsWith('https://') && !environment.supabaseUrl.includes('YOUR_PROJECT_ID') && !environment.supabaseAnonKey.includes('YOUR_SUPABASE');

  constructor(private auth: AuthService) {}

  async getAll(): Promise<Neighborhood[]> {
    if (!this.configured) return this.getLocal();
    const rows = await this.request<any[]>('/rest/v1/neighborhoods?select=*&order=name.asc');
    return rows.map(row => this.fromRow(row));
  }

  async getPublished(): Promise<Neighborhood[]> {
    if (!this.configured) return this.getLocal().filter(n => n.published);
    const rows = await this.request<any[]>('/rest/v1/neighborhoods?select=*&published=eq.true&order=name.asc');
    return rows.map(row => this.fromRow(row));
  }

  async getBySlug(slug: string): Promise<Neighborhood | undefined> {
    if (!this.configured) return this.getLocal().find(n => n.slug === slug && n.published);
    const rows = await this.request<any[]>(`/rest/v1/neighborhoods?select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`);
    return rows.length ? this.fromRow(rows[0]) : undefined;
  }

  async getById(id: string): Promise<Neighborhood | undefined> {
    if (!id) return undefined;
    if (!this.configured) return this.getLocal().find(n => n.id === id && n.published);
    const rows = await this.request<any[]>(`/rest/v1/neighborhoods?select=*&id=eq.${encodeURIComponent(id)}&published=eq.true&limit=1`);
    return rows.length ? this.fromRow(rows[0]) : undefined;
  }

  async save(n: Neighborhood): Promise<void> {
    if (!this.configured) {
      const all = this.getLocal();
      const index = all.findIndex(item => item.id === n.id);
      const saved = n.id ? n : { ...n, id: `local-${crypto.randomUUID()}` };
      if (index >= 0) all[index] = saved; else all.push(saved);
      localStorage.setItem(this.storageKey, JSON.stringify(all));
      return;
    }
    const row = { slug: n.slug, name: n.name, description: n.description, logo_url: n.logoUrl || '', published: n.published };
    if (n.id) {
      await this.request(`/rest/v1/neighborhoods?id=eq.${encodeURIComponent(n.id)}`, { method: 'PATCH', body: JSON.stringify(row), headers: { Prefer: 'return=minimal' } });
    } else {
      await this.request('/rest/v1/neighborhoods', { method: 'POST', body: JSON.stringify(row), headers: { Prefer: 'return=minimal' } });
    }
  }

  /** מחיקת שכונה. העסקים עצמם לא נמחקים, רק מנותק השיוך שלהם (ON DELETE SET NULL). */
  async delete(id: string): Promise<void> {
    if (!this.configured) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.getLocal().filter(n => n.id !== id)));
      return;
    }
    await this.request(`/rest/v1/neighborhoods?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  private getLocal(): Neighborhood[] {
    try { return JSON.parse(localStorage.getItem(this.storageKey) || '[]') as Neighborhood[]; }
    catch { return []; }
  }

  private fromRow(row: any): Neighborhood {
    return { id: row.id, slug: row.slug, name: row.name, description: row.description || '', logoUrl: row.logo_url || '', published: !!row.published };
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
      if (/neighborhood/i.test(message) && /(does not exist|schema cache)/i.test(message)) {
        return 'טבלת השכונות עדיין לא נוצרה. יש להריץ ב-Supabase את הקובץ 202611050001_neighborhoods.sql.';
      }
      if (/duplicate key|already exists|unique/i.test(message)) return 'כתובת הקישור כבר קיימת. בחרי כתובת אחרת.';
      return message;
    } catch { return body || `שגיאת שרת (${response.status})`; }
  }
}
