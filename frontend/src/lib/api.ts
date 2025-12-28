import { useAuthStore } from '@/store/authStore';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private onUnauthorized: () => void;

  constructor(
    baseUrl: string = API_BASE_URL,
    getToken?: () => string | null,
    onUnauthorized?: () => void
  ) {
    this.baseUrl = baseUrl;
    this.getToken = getToken || (() => null);
    this.onUnauthorized = onUnauthorized || (() => {});
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
      const token = this.getToken();
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      // Add Content-Type for non-FormData requests
      if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Handle unauthorized (401) - clear auth
      if (response.status === 401) {
        this.onUnauthorized();
        throw new Error(data.error || 'Authentication required');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth methods
  async signup(data: { email: string; password: string; name?: string }) {
    return this.request<{ user: any; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ id: string; email: string; name: string | null }>('/auth/me');
  }

  // Projects
  async createProject(data: any) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`);
  }

  async getProjects() {
    return this.request('/projects');
  }

  // Prompts
  async createPrompt(data: any) {
    return this.request('/prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPrompts() {
    return this.request('/prompts');
  }

  async getPrompt(id: string) {
    return this.request(`/prompts/${id}`);
  }

  async updatePrompt(id: string, data: any) {
    return this.request(`/prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Blueprints
  async createBlueprint(data: any) {
    return this.request('/blueprints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBlueprints(type?: string) {
    const endpoint = type ? `/blueprints?type=${type}` : '/blueprints';
    return this.request(endpoint);
  }

  async getBlueprint(id: string) {
    return this.request(`/blueprints/${id}`);
  }

  async updateBlueprint(id: string, data: any) {
    return this.request(`/blueprints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // File Upload
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request('/upload', {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }
}

// Create apiClient with auth integration
const getToken = () => useAuthStore.getState().token;
const onUnauthorized = () => useAuthStore.getState().clearAuth();

export const apiClient = new ApiClient(API_BASE_URL, getToken, onUnauthorized);
