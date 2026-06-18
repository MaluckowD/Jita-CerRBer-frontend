export type UserRole = "user" | "admin";
export type UserProjectRole = "LEAD" | "MEMBER";
export type TaskStage = "NEW" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Token {
  access_token: string;
  refresh_token?: string | null;
  token_type: string;
}

export interface UserProject {
  id: string;
  name: string;
  lead_id: string;
  deleted_at: string | null;
}

export interface UserProjectMembership {
  role: UserProjectRole;
  project: UserProject;
  member_from: string;
}

export interface UserApiResponse {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  projects: UserProjectMembership[];
}

export interface ProjectLead {
  id: string;
  name: string;
  surname: string;
  email: string;
}

export interface ProjectComponent {
  id: string;
  name: string;
  description?: string | null;
}

export interface ProjectInitiativeClassification {
  id: string;
  name: string;
  description?: string | null;
}

export interface ProjectInfoResponse {
  id: string;
  name: string;
  shortname: string;
  description?: string | null;
  task_description_template?: string | null;
  lead: ProjectLead;
  components: ProjectComponent[];
  initiative_classifications: ProjectInitiativeClassification[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface TaskInfoResponse {
  id: string;
  short_id: number;
  project_id: string;
  initiative_classification_id: string | null;
  component_id: string | null;
  assignee_id: string | null;
  reporter_id: string;
  name: string;
  description: string;
  priority: TaskPriority;
  stage: TaskStage;
  planned_start: string | null;
  planned_end: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AttachmentDataResponse {
  id: string;
  url: string;
  type: string;
  params: Record<string, unknown> | null;
}

export interface UserCommentAttachmentResponse {
  id: string;
  created_at: string;
  deleted_at: string | null;
  attachment: AttachmentDataResponse;
}

export interface UserCommentResponse {
  id: string;
  task_id: string;
  user_id: string;
  text: string;
  created_at: string;
  deleted_at: string | null;
  attachments: UserCommentAttachmentResponse[];
}

export interface TaskUserResponse {
  id: string;
  name: string;
}

export interface TaskProjectResponse {
  id: string;
  name: string;
  shortname: string;
  task_description_template: string;
}

export interface InitiativeClassificationResponse {
  id: string;
  name: string;
  description: string;
}

export interface ProjectComponentResponse {
  id: string;
  name: string;
  description: string;
}

export interface TaskWithDetailsResponse {
  id: string;
  short_id: number;
  name: string;
  description: string;
  stage: TaskStage;
  priority: TaskPriority;
  planned_start: string | null;
  planned_end: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  project: TaskProjectResponse;
  initiative_classification: InitiativeClassificationResponse | null;
  component: ProjectComponentResponse | null;
  assignee: TaskUserResponse | null;
  reporter: TaskUserResponse;
  comments: UserCommentResponse[];
}

export interface OperationResponse {
  status: string;
  detail: string;
}

export interface UploadResponse {
  url: string;
}

// Request types
export interface UserCreate {
  name: string;
  surname: string;
  email: string;
  password: string;
}

export interface UserAuth {
  email: string;
  password: string;
}

export interface UserEdit {
  name?: string | null;
  surname?: string | null;
}

export interface ProjectCreate {
  name: string;
  shortname: string;
  description?: string | null;
}

export interface ProjectUpdate {
  name?: string | null;
  shortname?: string | null;
  description?: string | null;
  task_description_template?: string | null;
}

export interface ProjectComponentCreate {
  name: string;
  description: string;
}

export interface ProjectComponentUpdate {
  name?: string | null;
  description?: string | null;
}

export interface ProjectInitiativeClassificationCreate {
  name: string;
  description: string;
}

export interface ProjectInitiativeClassificationUpdate {
  name?: string | null;
  description?: string | null;
}

export interface TaskCreate {
  project_id: string;
  initiative_classification_id?: string | null;
  component_id?: string | null;
  assignee_id?: string | null;
  name: string;
  description: string;
  priority: TaskPriority;
  planned_start?: string | null;
  planned_end?: string | null;
}

export interface TaskUpdate {
  initiative_classification_id?: string | null;
  component_id?: string | null;
  assignee_id?: string | null;
  name?: string | null;
  description?: string | null;
  priority?: TaskPriority | null;
  planned_start?: string | null;
  planned_end?: string | null;
}

export interface TaskFilters {
  project_id?: string;
  initiative_classification_id?: string;
  component_id?: string;
  assignee_id?: string;
  reporter_id?: string;
  stage?: TaskStage;
  priority?: TaskPriority;
}

export interface UserCommentCreate {
  text: string;
  attachments?: string[] | null;
}

export interface UserCommentUpdate {
  text?: string | null;
  to_remove_attachments?: string[] | null;
  new_attachments?: string[] | null;
}
