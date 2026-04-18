import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor for JWT
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for better error visibility
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Axios Error Triggered:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  size: number;
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  error_message?: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  document_ids: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const authApi = {
  login: (data: any) => {
    const params = new URLSearchParams();
    params.append("username", data.email); // OAuth2 expects 'username'
    params.append("password", data.password);
    return api.post("/auth/login", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  },
  signup: (data: any) => api.post("/auth/signup", data),
};

export const documentApi = {
  upload: (formData: FormData) => api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  getAll: () => api.get<Document[]>("/documents"),
};

export const chatApi = {
  sendMessage: (data: { session_id?: string; message: string; document_ids?: string[] }) => 
    api.post("/chat", data),
  getSessions: () => api.get<any[]>("/chat/sessions"),
  getMessages: (sessionId: string) => api.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),
};

export const learningApi = {
  generateFlashcards: (topic: string, docIds?: string[], count: number = 5) => 
    api.post("/learning/generate/flashcards", { topic, document_ids: docIds, count }),
  generateQuiz: (topic: string, docIds?: string[], count: number = 5) => 
    api.post("/learning/generate/quiz", { topic, document_ids: docIds, count }),
};
