import axios from 'axios';

// 1. הגדרת ה-Instance (הגדרות ברירת מחדל כפי שנדרש במטלה)
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:5036", 
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to inject the token
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error("Axios Interceptor caught an error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response && error.response.status === 401) {
            const isLoginRequest = error.config && error.config.url.includes('/login');
            
            if (!isLoginRequest) {
                localStorage.removeItem('token');
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default {
    getTasks: async () => {
        const result = await apiClient.get('/items');
        return result.data;
    },

    addTask: async (name) => {
        const result = await apiClient.post('/items', { 
            Name: name, 
            IsComplete: false 
        });
        return result.data;
    },

    setCompleted: async (id, name, isComplete) => {
        const result = await apiClient.put(`/items/${id}`, { 
            IdItems: id,      
            Name: name, 
            IsComplete: isComplete 
        });
        return result.data;
    },

    deleteTask: async (id) => {
        const result = await apiClient.delete(`/items/${id}`);
        return result.data;
    },

    register: async (username, password) => {
        const result = await apiClient.post('/register', { 
          UserName: username, 
          Password: password 
        });
        return result.data;
    },
    
    login: async (username, password) => {
        const result = await apiClient.post('/login', { 
          UserName: username, 
          Password: password 
        });
        if (result.data.token) {
            localStorage.setItem('token', result.data.token);
        }
        return result.data;
    },
    
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = "/login";
    }
};