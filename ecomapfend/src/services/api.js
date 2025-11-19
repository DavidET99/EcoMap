class ApiService {
  getBaseUrl() {
    if (process.env.NODE_ENV === 'production') {
      return process.env.REACT_APP_API_URL;
    }
    return 'http://localhost:4000';
  }

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
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
      body: JSON.stringify({ email, password })
    });
  }

  async register(nombre, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password })
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
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(puntoData)
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
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(comentarioData)
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