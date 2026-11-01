import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly key = 'seman-auth';
  isLoggedIn(): boolean {
    try {
      const session = JSON.parse(localStorage.getItem(this.key) || 'null');
      return !!session?.access_token && (!session.expires_at || session.expires_at * 1000 > Date.now());
    } catch { return false; }
  }

  async signIn(email: string, password: string): Promise<void> {
    if (environment.supabaseUrl.includes('YOUR_PROJECT_ID') || environment.supabaseAnonKey.includes('YOUR_SUPABASE')) throw new Error('יש להגדיר תחילה את פרטי Supabase בקובץ environment.ts.');
    const response = await fetch(`${environment.supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { apikey: environment.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.msg || result.message || result.error_description || 'ההתחברות נכשלה. בדקי את כתובת המייל והסיסמה.');
    localStorage.setItem(this.key, JSON.stringify({ ...result, expires_at: Math.floor(Date.now() / 1000) + result.expires_in }));
  }

  signOut(): void { localStorage.removeItem(this.key); }
}
