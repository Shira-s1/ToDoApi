import axios from 'axios';

// 1. הגדרת ה-Instance (הגדרות ברירת מחדל כפי שנדרש במטלה)
const apiClient = axios.create({
    baseURL: "http://localhost:5036", // ודאי שזה הפורט שלך
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

// 2. Interceptor לתפיסת שגיאות ורישום ללוג + טיפול ב-401
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error("Axios Interceptor caught an error:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // טיפול ב-401 (רק אם זה לא בקשת התחברות עצמה, כדי לאפשר טיפול בשגיאה בקומפוננטה)
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
    // שליפת כל המשימות
    getTasks: async () => {
        const result = await apiClient.get('/items');
        return result.data;
    },

    // הוספת משימה חדשה
    addTask: async (name) => {
        // שולחים אובייקט שתואם למחלקת Item ב-C#
        const result = await apiClient.post('/items', { 
            Name: name, 
            IsComplete: false 
        });
        return result.data;
    },

    // עדכון סטטוס משימה - התיקון לשגיאת 400 נמצא כאן!
    setCompleted: async (id, name, isComplete) => {
        // ה-API מצפה ל-ID גם ב-URL וגם בתוך ה-Body
        // ושמות השדות חייבים להתחיל באות גדולה (IdItems, Name, IsComplete)
        const result = await apiClient.put(`/items/${id}`, { 
            IdItems: id,      
            Name: name, 
            IsComplete: isComplete 
        });
        return result.data;
    },

    // מחיקת משימה
    deleteTask: async (id) => {
        const result = await apiClient.delete(`/items/${id}`);
        return result.data;
    },

    // Auth methods
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