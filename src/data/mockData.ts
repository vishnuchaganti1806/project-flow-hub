export type IdeaStatus = "draft" | "submitted" | "under-review" | "approved" | "rejected";

export type UserRole = "admin" | "guide" | "student";

export interface ProjectIdea {
  id: string;
  title: string;
  abstract: string;
  problemStatement: string;
  techStack: string[];
  expectedOutcome: string;
  status: IdeaStatus;
  studentId: string;
  studentName: string;
  guideFeedback?: string;
  submittedAt: string;
  updatedAt: string;
  attachments?: string[];
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  skills: string[];
  languages?: string[];
  rollNumber?: string;
  branch?: string;
  year?: string;
  teamId?: string;
  guideId?: string;
  guideName?: string;
  progress: number;
  rating?: number;
}

export interface Guide {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  specialization: string[];
  assignedStudents: number;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  guide_id?: string;
  projectId?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
}

export interface DoubtThread {
  id: string;
  studentId: string;
  studentName: string;
  guideId: string;
  guideName: string;
  subject: string;
  messages: { sender: string; text: string; timestamp: string }[];
  resolved: boolean;
}

export interface Review {
  id: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Deadline {
  id: string;
  title: string;
  date: string;
  projectId?: string;
}
