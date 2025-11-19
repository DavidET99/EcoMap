class ApiService {
  getBaseUrl() {
    if (process.env.NODE_ENV === 'production') {
      return process.env.REACT_APP_API_URL || 'https://ecomap-x5an.onrender.com';
    }
    return process.env.REACT_APP_API_URL || 'http://localhost:4000';
  }

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // ========== AUTH ==========
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async register(nombre, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { nombre, email, password }
    });
  }

  // ========== PUNTOS ==========
  async getPuntos() {
    return this.request('/puntos');
  }

  async createPunto(puntoData) {
    const token = localStorage.getItem('token');
    return this.request('/puntos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: puntoData
    });
  }

  async deletePunto(puntoId) {
    const token = localStorage.getItem('token');
    return this.request(`/puntos/${puntoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // ========== COMENTARIOS ==========
  async getComentarios(puntoId) {
    return this.request(`/comentarios/${puntoId}`);
  }

  async createComentario(comentarioData) {
    const token = localStorage.getItem('token');
    return this.request('/comentarios', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: comentarioData,
    });
  }

  async deleteComentario(comentarioId) {
    const token = localStorage.getItem('token');
    return this.request(`/comentarios/${comentarioId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // ========== PERFIL ==========
  async getPerfil() {
    const token = localStorage.getItem('token');
    return this.request('/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async getMisComentarios() {
    const token = localStorage.getItem('token');
    return this.request('/mis-comentarios', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
}

const apiServiceInstance = new ApiService();
export default apiServiceInstance;