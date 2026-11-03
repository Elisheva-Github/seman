import { Injectable } from '@angular/core';
import { Business } from '../models/business.model';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

const DEMO_BUSINESSES: Business[] = [
  { id: 'demo-1', slug: 'miri-paot', name: 'מירי פאות', category: 'עיצוב פאות ומטפחות', description: 'מבחר פאות ומטפחות בהתאמה אישית, עם יחס אישי ומקצועי.', phone: '052-0000001', email: 'miri@example.com', website: '', address: 'נווה יעקב, ירושלים', hours: 'א׳–ה׳ בתיאום מראש', imageUrl: '', logoUrl: '', faviconUrl: '', galleryUrls: [], whatsapp: '972520000001', published: true, showInExamples: true, sendVisitReportEmail: false, showRecommendations: true },
  { id: 'demo-2', slug: 'esti-cosmetics', name: 'אסתי קוסמטיקה', category: 'טיפולי פנים וקוסמטיקה', description: 'טיפולי קוסמטיקה באווירה נעימה ומקצועית.', phone: '052-0000002', email: 'esti@example.com', website: '', address: 'פסגת זאב, ירושלים', hours: 'א׳–ה׳ 09:00–18:00', imageUrl: '', logoUrl: '', faviconUrl: '', galleryUrls: [], whatsapp: '972520000002', published: true, showInExamples: true, sendVisitReportEmail: false, showRecommendations: true },
  { id: 'demo-3', slug: 'a-cohen', name: 'שיפוצים א. כהן', category: 'שיפוץ ותיקונים', description: 'עבודות שיפוץ, תיקונים ותחזוקה לבית ולעסק.', phone: '052-0000003', email: 'cohen@example.com', website: '', address: 'חיפה', hours: 'א׳–ה׳ 08:00–17:00', imageUrl: '', logoUrl: '', faviconUrl: '', galleryUrls: [], whatsapp: '972520000003', published: true, showInExamples: true, sendVisitReportEmail: false, showRecommendations: true }
];



export interface SemanSettings {
  sendVisitReportEmail: boolean;
  showRecommendationsSection: boolean;
}

export interface Recommendation {
  id: string;
  customerName: string;
  content: string;
  displayOrder: number;
  published: boolean;
  businessId: string;
}

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly storageKey = 'seman-businesses';

  constructor(private auth: AuthService) {}
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

  async getExamples(): Promise<Business[]> {
    if (!this.configured) return this.getLocal().filter(b => b.published && b.showInExamples);
    const rows = await this.request<any[]>('/rest/v1/businesses?select=*&published=eq.true&show_in_examples=eq.true&order=created_at.desc');
    return rows.map(row => this.fromRow(row));
  }

  async getSettings(): Promise<SemanSettings> {
    if (!this.configured) return { sendVisitReportEmail: false, showRecommendationsSection: false };
    const rows = await this.request<any[]>('/rest/v1/seman_settings?select=*&id=eq.true&limit=1');
    const row = rows[0];
    return {
      sendVisitReportEmail: !!row?.send_visit_report_email,
      showRecommendationsSection: !!row?.show_recommendations_section
    };
  }

  async saveSettings(settings: SemanSettings): Promise<void> {
    if (!this.configured) throw new Error('שמירת הגדרות זמינה לאחר חיבור Supabase.');
    await this.request('/rest/v1/seman_settings?id=eq.true', {
      method: 'PATCH',
      body: JSON.stringify({
        send_visit_report_email: settings.sendVisitReportEmail,
        show_recommendations_section: settings.showRecommendationsSection,
        updated_at: new Date().toISOString()
      }),
      headers: { Prefer: 'return=minimal' }
    });
  }

  async getRecommendations(includeUnpublished = false, businessId?: string | null): Promise<Recommendation[]> {
    if (!this.configured) return [];
    const filter = includeUnpublished ? '' : '&published=eq.true';
    // undefined = all recommendations (admin); null = Seman-only; string = one business.
    const businessFilter = businessId === null
      ? '&business_id=is.null'
      : businessId
        ? `&business_id=eq.${encodeURIComponent(businessId)}`
        : '';
    const rows = await this.request<any[]>(`/rest/v1/seman_recommendations?select=*&order=display_order.asc,created_at.desc${filter}${businessFilter}`);
    return rows.map(row => ({
      id: row.id,
      customerName: row.customer_name,
      content: row.content,
      displayOrder: row.display_order ?? 0,
      published: !!row.published,
      businessId: row.business_id || ''
    }));
  }

  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    if (!this.configured) throw new Error('שמירת המלצות זמינה לאחר חיבור Supabase.');
    const row = {
      customer_name: recommendation.customerName.trim(),
      content: recommendation.content.trim(),
      display_order: recommendation.displayOrder,
      published: recommendation.published,
      business_id: recommendation.businessId || null
    };
    if (recommendation.id) {
      await this.request(`/rest/v1/seman_recommendations?id=eq.${encodeURIComponent(recommendation.id)}`, {
        method: 'PATCH', body: JSON.stringify(row), headers: { Prefer: 'return=minimal' }
      });
    } else {
      await this.request('/rest/v1/seman_recommendations', {
        method: 'POST', body: JSON.stringify(row), headers: { Prefer: 'return=minimal' }
      });
    }
  }

  async deleteRecommendation(id: string): Promise<void> {
    if (!this.configured) throw new Error('מחיקת המלצות זמינה לאחר חיבור Supabase.');
    await this.request(`/rest/v1/seman_recommendations?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
  }

  async deleteBusinessRecommendations(businessId: string): Promise<void> {
    if (!this.configured) throw new Error('מחיקת המלצות זמינה לאחר חיבור Supabase.');
    await this.request(`/rest/v1/seman_recommendations?business_id=eq.${encodeURIComponent(businessId)}`, { method: 'DELETE' });
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
      headers: await this.authHeaders(file.type, { 'x-upsert': 'false' }),
      body: file
    });
    if (!response.ok) throw new Error(await this.errorMessage(response));
    return `${environment.supabaseUrl}/storage/v1/object/public/business-images/${path}`;
  }

  private getLocal(): Business[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) return (JSON.parse(saved) as Business[]).map(b => ({ ...b, showInExamples: b.showInExamples ?? true, sendVisitReportEmail: b.sendVisitReportEmail ?? false, showRecommendations: b.showRecommendations ?? true }));
      localStorage.setItem(this.storageKey, JSON.stringify(DEMO_BUSINESSES));
      return [...DEMO_BUSINESSES];
    } catch { return [...DEMO_BUSINESSES]; }
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
    const content = await response.text();
    return content ? JSON.parse(content) as T : undefined as T;
  }

  private async authHeaders(contentType: string, extra: Record<string, string> = {}): Promise<Headers> {
    const headers = new Headers(extra);
    headers.set('apikey', environment.supabaseAnonKey);
    headers.set('Content-Type', contentType);
    const { data } = await this.auth.getSession();
    if (data.session?.access_token) headers.set('Authorization', `Bearer ${data.session.access_token}`);
    return headers;
  }

  private async errorMessage(response: Response): Promise<string> {
    const body = await response.text();
    try { const parsed = JSON.parse(body); return parsed.message || parsed.msg || parsed.error_description || body; }
    catch { return body || `שגיאת שרת (${response.status})`; }
  }

  private fromRow(row: any): Business {
    return { id: row.id, slug: row.slug, name: row.name, category: row.category || '', description: row.description || '', phone: row.phone || '', email: row.email || '', website: row.website || '', address: row.address || '', hours: row.hours || '', imageUrl: row.image_url || '', logoUrl: row.logo_url || '', faviconUrl: row.favicon_url || '', galleryUrls: row.gallery_urls || [], whatsapp: row.whatsapp || '', published: !!row.published, showInExamples: !!row.show_in_examples, sendVisitReportEmail: !!row.send_visit_report_email, showRecommendations: row.show_recommendations !== false };
  }

  private toRow(b: Business): Record<string, unknown> {
    const row: Record<string, unknown> = { slug: b.slug, name: b.name, category: b.category, description: b.description, phone: b.phone, email: b.email, website: b.website, address: b.address, hours: b.hours, image_url: b.imageUrl, logo_url: b.logoUrl || '', favicon_url: b.faviconUrl || '', gallery_urls: b.galleryUrls || [], whatsapp: b.whatsapp, published: b.published, show_in_examples: b.showInExamples, send_visit_report_email: b.sendVisitReportEmail, show_recommendations: b.showRecommendations };
    if (b.id && !b.id.startsWith('local-')) row['id'] = b.id;
    return row;
  }
}
