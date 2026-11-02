import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  async login(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async logout() {
    return await this.supabase.auth.signOut();
  }

  async isLoggedIn(): Promise<boolean> {
    const { data } = await this.supabase.auth.getSession();
    return !!data.session;
  }
}