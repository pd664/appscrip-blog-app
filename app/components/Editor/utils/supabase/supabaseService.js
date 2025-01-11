// utils/supabase/supabaseService.js
import { createClient } from '@supabase/supabase-js';
class SupabaseService {
  constructor() {
    this.supabase = createClient(
        'https://hbwraouugycbgarnblwp.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhid3Jhb3V1Z3ljYmdhcm5ibHdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0MjUwMTUsImV4cCI6MjA1MjAwMTAxNX0.4oC_ah05OXeDV14ubxRuSDc7TlfWkh6GSgTigCRTsJo'
      );
      this.cache = {}; 
  }

  async fetchEditorData() {
    const { data, error } = await this.supabase
      .from('editor_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching editor data:', error);
      throw error;
    }

    return data;
  }

  async fetchPostBySlug(slug) {
    const cachedPost = await this.getFromCache(slug);
    if (cachedPost) return cachedPost;

    const { data, error } = await this.supabase
      .from('editor_data')
      .select('*')
      .eq('title', slug.replace(/-/g, ' '))
      .single();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    if (data) {
      await this.setCache(slug, data);
    }

    return data;
  }

  async getFromCache(slug) {
    if (this.cache[slug]) {
      console.log('Fetching from cache');
      return this.cache[slug];
    }
    return null;
  }

  async setCache(slug, data) {
    this.cache[slug] = data;
    console.log('Post cached');
  }
  async saveEditorContent(content, imageUrl, title) {
    const { data, error } = await this.supabase
      .from('editor_data')
      .insert([{
        content,
        title,
        image_url: imageUrl || '',
      }])
      .select();

    if (error) throw error;
    return data;
  }
}

export const supabaseService = new SupabaseService();
