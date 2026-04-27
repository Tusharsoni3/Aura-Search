import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => config,
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`[API Response Error] ${status} | ${message}`);
    return Promise.reject(error);
  },
);

export default api;

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  /** POST /api/auth/signup */
  signup: (data) => api.post("/auth/signup", data),

  /** POST /api/auth/login */
  login: (data) => api.post("/auth/login", data),

  /** POST /api/auth/logout */
  logout: () => api.post("/auth/logout"),

  /** GET /api/auth/get-me */
  getMe: () => api.get("/auth/get-me"),

  /** POST /api/auth/verify  — body: { givenOtp } */
  verify: (givenOtp) => api.post("/auth/verify", { givenOtp }),

  /** POST /api/auth/forgotPassword  — body: { email } */
  forgotPassword: (email) => api.post("/auth/forgotPassword", { email }),

  /** POST /api/auth/resetPassword/:token  — body: { newPassword } */
  resetPassword: (token, newPassword) =>
    api.post(`/auth/resetPassword/${token}`, { newPassword }),

  /** POST /api/auth/twoFactorAuth  — body: { input: boolean } */
  twoFactorAuth: (input) => api.post("/auth/twoFactorAuth", { input }),

  /** POST /api/auth/verify2FAcode  — body: { code, tempToken } */
  verify2FAcode: (code, tempToken) =>
    api.post("/auth/verify2FAcode", { code, tempToken }),
};

// ─── Chat API ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  /** GET /api/chats  — returns { userChats: [...] } */
  getChats: () => api.get("/chats"),

  /** GET /api/chats/:chatId/messages  — returns { messages: [...] } */
  getMessages: (chatId) => api.get(`/chats/${chatId}/messages`),

  /**
   * POST /api/chats/message
   * body: { message: string, chats: chatId | undefined }
   * returns: { title, chat: { id }, aiMessage }
   */
  sendMessage: (message, chatId) =>
    api.post("/chats/message", { message, chats: chatId }),

  /** DELETE /api/chats/delete/:chatId */
  deleteChat: (chatId) => api.delete(`/chats/delete/${chatId}`),
};
