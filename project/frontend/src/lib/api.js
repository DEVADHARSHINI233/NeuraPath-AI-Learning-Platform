const BASE = "/api";

function getToken() {
  return localStorage.getItem("np_token");
}

async function request(path, { method = "GET", body, auth = true, isForm = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const message = (data && data.error) || "Something went wrong";
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  getProfile: () => request("/profile"),
  updateProfile: (payload) => request("/profile", { method: "PUT", body: payload }),

  listCourses: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/courses${qs ? `?${qs}` : ""}`, { auth: false });
  },
  getCourse: (id) => request(`/courses/${id}`, { auth: false }),
  createCourse: (payload) => request("/courses", { method: "POST", body: payload }),
  enroll: (id) => request(`/courses/${id}/enroll`, { method: "POST" }),
  myEnrollments: () => request("/my/enrollments"),

  getRecommendations: () => request("/recommendations"),

  analyzeResume: (formData) => request("/resume/analyze", { method: "POST", body: formData, isForm: true }),

  listCareers: () => request("/career-guidance", { auth: false }),
  getCareer: (name) => request(`/career-guidance/${encodeURIComponent(name)}`, { auth: false }),

  quizCategories: () => request("/quiz/categories", { auth: false }),
  getQuiz: (category, limit = 8) => request(`/quiz/${encodeURIComponent(category)}?limit=${limit}`, { auth: false }),
  submitQuiz: (payload) => request("/quiz/submit", { method: "POST", body: payload }),
  quizHistory: () => request("/my/quiz-history"),

  chat: (message) => request("/chatbot", { method: "POST", body: { message }, auth: false }),

  dashboardStats: () => request("/dashboard/stats"),
  adminStats: () => request("/admin/stats"),
};

export { getToken };
