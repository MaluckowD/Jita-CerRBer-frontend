import type {
  Token, UserCreate, UserAuth, UserEdit, UserApiResponse,
  ProjectCreate, ProjectUpdate, ProjectInfoResponse,
  ProjectComponentCreate, ProjectComponentUpdate,
  ProjectInitiativeClassificationCreate, ProjectInitiativeClassificationUpdate,
  TaskCreate, TaskUpdate, TaskFilters, TaskInfoResponse, TaskWithDetailsResponse,
  UserCommentCreate, UserCommentUpdate, UserCommentResponse,
  OperationResponse, UploadResponse, UserProjectRole,
} from "./types";

const BASE_URL = "http://localhost:8000";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (withAuth) {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${localStorage.getItem("access_token")}`;
      const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retry.ok) throw new ApiError(retry.status, await retry.text());
      return retry.json();
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new Event("auth:logout"));
    throw new ApiError(401, "Unauthorized");
  }

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body.detail ?? JSON.stringify(body);
    } catch {}
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/v2/users/auth/token/refresh`, {
      method: "POST",
      headers: { Authorization: `Bearer ${refresh}` },
    });
    if (!res.ok) return false;
    const data: Token = await res.json();
    localStorage.setItem("access_token", data.access_token);
    return true;
  } catch {
    return false;
  }
}

function buildQuery(params: Record<string, string | undefined | null>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null) q.set(k, v);
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

// Users
export const usersApi = {
  register: (data: UserCreate) =>
    request<Token>("/api/v2/users/register", { method: "POST", body: JSON.stringify(data) }, false),

  login: (data: UserAuth) =>
    request<Token>("/api/v2/users/auth/token/login", { method: "POST", body: JSON.stringify(data) }, false),

  getMe: () => request<UserApiResponse>("/api/v2/users/me"),

  editMe: (data: UserEdit) =>
    request<UserApiResponse>("/api/v2/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  deleteMe: () =>
    request<OperationResponse>("/api/v2/users/me", { method: "DELETE" }),
};

// Projects
export const projectsApi = {
  getAll: () => request<ProjectInfoResponse[]>("/api/v2/project/"),

  getById: (id: string) => request<ProjectInfoResponse>(`/api/v2/project/${id}`),

  create: (data: ProjectCreate) =>
    request<ProjectInfoResponse>("/api/v2/project/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: ProjectUpdate) =>
    request<ProjectInfoResponse>(`/api/v2/project/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<OperationResponse>(`/api/v2/project/${id}`, { method: "DELETE" }),

  addMember: (projectId: string, userId: string, role: UserProjectRole = "MEMBER") =>
    request<OperationResponse>(
      `/api/v2/project/${projectId}/membership/${userId}?role=${role}`,
      { method: "POST" },
    ),

  removeMember: (projectId: string, userId: string) =>
    request<OperationResponse>(`/api/v2/project/${projectId}/membership/${userId}`, { method: "DELETE" }),

  createComponent: (projectId: string, data: ProjectComponentCreate) =>
    request<ProjectInfoResponse>(`/api/v2/project/${projectId}/component/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateComponent: (projectId: string, componentId: string, data: ProjectComponentUpdate) =>
    request<ProjectInfoResponse>(`/api/v2/project/${projectId}/component/${componentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteComponent: (projectId: string, componentId: string) =>
    request<OperationResponse>(`/api/v2/project/${projectId}/component/${componentId}`, { method: "DELETE" }),

  createInitiativeClassification: (projectId: string, data: ProjectInitiativeClassificationCreate) =>
    request<ProjectInfoResponse>(`/api/v2/project/${projectId}/initiative_classification/`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateInitiativeClassification: (projectId: string, classificationId: string, data: ProjectInitiativeClassificationUpdate) =>
    request<ProjectInfoResponse>(
      `/api/v2/project/${projectId}/initiative_classification/${classificationId}`,
      { method: "PATCH", body: JSON.stringify(data) },
    ),

  deleteInitiativeClassification: (projectId: string, classificationId: string) =>
    request<OperationResponse>(
      `/api/v2/project/${projectId}/initiative_classification/${classificationId}`,
      { method: "DELETE" },
    ),
};

// Tasks
export const tasksApi = {
  getAll: (filters?: TaskFilters) => {
    const params = buildQuery({
      project_id: filters?.project_id,
      initiative_classification_id: filters?.initiative_classification_id,
      component_id: filters?.component_id,
      assignee_id: filters?.assignee_id,
      reporter_id: filters?.reporter_id,
      stage: filters?.stage,
      priority: filters?.priority,
    });
    return request<TaskInfoResponse[]>(`/api/v2/task/${params}`);
  },

  getById: (id: string) => request<TaskWithDetailsResponse>(`/api/v2/task/${id}`),

  create: (data: TaskCreate) =>
    request<TaskInfoResponse>("/api/v2/task/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: TaskUpdate) =>
    request<TaskInfoResponse>(`/api/v2/task/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<OperationResponse>(`/api/v2/task/${id}`, { method: "DELETE" }),

  nextStage: (id: string) =>
    request<TaskInfoResponse>(`/api/v2/task/${id}/next-stage`, { method: "POST" }),

  createComment: (taskId: string, data: UserCommentCreate) =>
    request<UserCommentResponse>(`/api/v2/task/${taskId}/comment`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateComment: (taskId: string, commentId: string, data: UserCommentUpdate) =>
    request<UserCommentResponse>(`/api/v2/task/${taskId}/comment/${commentId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteComment: (taskId: string, commentId: string) =>
    request<OperationResponse>(`/api/v2/task/${taskId}/comment/${commentId}`, { method: "DELETE" }),
};

// Media
export const mediaApi = {
  uploadPhoto: async (file: File): Promise<UploadResponse> => {
    const token = localStorage.getItem("access_token");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/v2/media/photo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  },

  uploadAudio: async (file: File): Promise<UploadResponse> => {
    const token = localStorage.getItem("access_token");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/v2/media/audio`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return res.json();
  },
};

export { ApiError };
