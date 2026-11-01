import { Injectable } from '@angular/core';
import { Business } from '../models/business.model';
import { environment } from '../../environments/environment';

const DEMO_BUSINESSES: Business[] = [
  { id: 'demo-1', slug: 'miri-paot', name: 'מירי פאות', category: 'עיצוב פאות ומטפחות', description: 'מבחר פאות ומטפחות בהתאמה אישית, עם יחס אישי ומקצועי.', phone: '052-0000001', email: 'miri@example.com', website: '', address: 'נווה יעקב, ירושלים', hours: 'א׳–ה׳ בתיאום מראש', imageUrl: '', galleryUrls: [], whatsapp: '972520000001', published: true },
  { id: 'demo-2', slug: 'esti-cosmetics', name: 'אסתי קוסמטיקה', category: 'טיפולי פנים וקוסמטיקה', description: 'טיפולי קוסמטיקה באווירה נעימה ומקצועית.', phone: '052-0000002', email: 'esti@example.com', website: '', address: 'פסגת זאב, ירושלים', hours: 'א׳–ה׳ 09:00–18:00', imageUrl: '', galleryUrls: [], whatsapp: '972520000002', published: true },
  { id: 'demo-3', slug: 'a-cohen', name: 'שיפוצים א. כהן', category: 'שיפוץ ותיקונים', description: 'עבודות שיפוץ, תיקונים ותחזוקה לבית ולעסק.', phone: '052-0000003', email: 'cohen@example.com', website: '', address: 'חיפה', hours: 'א׳–ה׳ 08:00–17:00', imageUrl: '', galleryUrls: [], whatsapp: '972520000003', published: true }
];

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly storageKey = 'seman-businesses';
  private readonly configured = environment.supabaseUrl.startsWith('https://') && !environment.supabaseUrl.includes('YOUR_PROJECT_ID') && !environment.supabaseAnonKey.includes('YOUR_SUPABASE');

  isCloudConfigured(): boolean { return this.configured; }
  isCloudMode(): boolean { return this.configured; }

  async getAll(): Promise<Business[]> {
    if (!this.configured) return this.getLocal();
    const rows = await this.request<any[]>('/rest/v1/businesses?select=*&order=created_at.desc');
    return rows.map(row => this.fromRow(row));
  }

  async getPublished(): Promise<Business[]> {
    if (!this.configured) return this.getLocal().filter(b => b.published);
    const rows = await this.request<any[]>('/rest/v1/businesses?select=*&published=eq.true&order=created_at.desc');
    return rows.map(row => this.fromRow(row));
  }

  async getBySlug(slug: string): Promise<Business | undefined> {
    if (!this.configured) return this.getLocal().find(b => b.slug === slug && b.published);
    const rows = await this.request<any[]>(`/rest/v1/businesses?select=*&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`);
    return rows.length ? this.fromRow(rows[0]) : undefined;
  }

  async save(business: Business): Promise<void> {
    if (!this.configured) {
      const all = this.getLocal();
      const index = all.findIndex(item => item.id === business.id);
      if (index >= 0) all[index] = business; else all.unshift(business);
      localStorage.setItem(this.storageKey, JSON.stringify(all));
      return;
    }
    const row = this.toRow(business);
    const method = business.id && !business.id.startsWith('local-') ? 'PATCH' : 'POST';
    const url = method === 'PATCH' ? `/rest/v1/businesses?id=eq.${encodeURIComponent(business.id)}` : '/rest/v1/businesses';
    await this.request(url, { method, body: JSON.stringify(row), headers: { Prefer: 'return=minimal' } });
  }

  getLocalCount(): number {
    try { return (JSON.parse(localStorage.getItem(this.storageKey) || '[]') as Business[]).length; }
    catch { return 0; }
  }

  async migrateLocalToCloud(): Promise<number> {
    if (!this.configured) throw new Error('יש להגדיר תחילה את Supabase.');
    const local = this.getLocal();
    if (!local.length) return 0;
    const rows = local.map(business => this.toRow({ ...business, id: `local-${crypto.randomUUID()}` }));
    await this.request('/rest/v1/businesses', { method: 'POST', body: JSON.stringify(rows), headers: { Prefer: 'return=minimal' } });
    localStorage.removeItem(this.storageKey);
    return local.length;
  }

  async delete(id: string): Promise<void> {
    if (!this.configured) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.getLocal().filter(b => b.id !== id)));
      return;
    }
    await this.request(`/rest/v1/businesses?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async uploadImage(file: File): Promise<string> {
    if (!this.configured) throw new Error('יש להגדיר תחילה פרויקט Supabase כדי להעלות תמונות לענן.');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${crypto.randomUUID()}-${safeName}`;
    const response = await fetch(`${environment.supabaseUrl}/storage/v1/object/business-images/${path}`, {
      method: 'POST',
      headers: { apikey: environment.supabaseAnonKey, ...(this.accessToken() ? { Authorization: `Bearer ${this.accessToken()}` } : {}), 'Content-Type': file.type, 'x-upsert': 'false' },
      body: file
    });
    if (!response.ok) throw new Error(await this.errorMessage(response));
    return `${environment.supabaseUrl}/storage/v1/object/public/business-images/${path}`;
  }

  private getLocal(): Business[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return JSON.parse(saved) as Business[];
      localStorage.setItem(this.storageKey, JSON.stringify(DEMO_BUSINESSES));
      return [...DEMO_BUSINESSES];
    } catch { return [...DEMO_BUSINESSES]; }
  }

  private async request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('apikey', environment.supabaseAnonKey);
    const token = this.accessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    headers.set('Content-Type', 'application/json');
    const response = await fetch(`${environment.supabaseUrl}${path}`, { ...options, headers });
    if (!response.ok) throw new Error(await this.errorMessage(response));
    if (response.status === 204) return undefined as T;
    const content = await response.text();
    return content ? JSON.parse(content) as T : undefined as T;
  }

  private accessToken(): string {
    try { return JSON.parse(localStorage.getItem('seman-auth') || '{}').access_token || ''; }
    catch { return ''; }
  }

  private async errorMessage(response: Response): Promise<string> {
    const body = await response.text();
    try { const parsed = JSON.parse(body); return parsed.message || parsed.msg || parsed.error_description || body; }
    catch { return body || `שגיאת שרת (${response.status})`; }
  }

  private fromRow(row: any): Business {
    return { id: row.id, slug: row.slug, name: row.name, category: row.category || '', description: row.description || '', phone: row.phone || '', email: row.email || '', website: row.website || '', address: row.address || '', hours: row.hours || '', imageUrl: row.image_url || '', galleryUrls: row.gallery_urls || [], whatsapp: row.whatsapp || '', published: !!row.published };
  }

  private toRow(b: Business): Record<string, unknown> {
    const row: Record<string, unknown> = { slug: b.slug, name: b.name, category: b.category, description: b.description, phone: b.phone, email: b.email, website: b.website, address: b.address, hours: b.hours, image_url: b.imageUrl, gallery_urls: b.galleryUrls || [], whatsapp: b.whatsapp, published: b.published };
    if (b.id && !b.id.startsWith('local-')) row['id'] = b.id;
    return row;
  }
}
