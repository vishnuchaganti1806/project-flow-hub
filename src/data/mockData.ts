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
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  skills: string[];
  teamId?: string;
  guideId?: string;
  guideName?: string;
  progress: number;
  rating?: number;
}

export interface Guide {
  id: string;
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

// ──── Mock Students ────
export const mockStudents: Student[] = [
  { id: "s1", name: "Aarav Patel", email: "aarav@university.edu", avatar: "AP", skills: ["React", "Python", "Machine Learning"], teamId: "t1", guideId: "g1", guideName: "Dr. Sharma", progress: 65, rating: 4.2 },
  { id: "s2", name: "Priya Singh", email: "priya@university.edu", avatar: "PS", skills: ["Java", "Spring Boot", "AWS"], teamId: "t1", guideId: "g1", guideName: "Dr. Sharma", progress: 40, rating: 3.8 },
  { id: "s3", name: "Rahul Verma", email: "rahul@university.edu", avatar: "RV", skills: ["Flutter", "Firebase", "Dart"], guideId: "g2", guideName: "Prof. Gupta", progress: 80, rating: 4.5 },
  { id: "s4", name: "Sneha Reddy", email: "sneha@university.edu", avatar: "SR", skills: ["Node.js", "MongoDB", "TypeScript"], teamId: "t2", guideId: "g2", guideName: "Prof. Gupta", progress: 25 },
  { id: "s5", name: "Vikram Joshi", email: "vikram@university.edu", avatar: "VJ", skills: ["C++", "OpenCV", "IoT"], guideId: "g1", guideName: "Dr. Sharma", progress: 55, rating: 4.0 },
  { id: "s6", name: "Ananya Desai", email: "ananya@university.edu", avatar: "AD", skills: ["React Native", "GraphQL", "PostgreSQL"], teamId: "t2", guideId: "g3", guideName: "Dr. Kumar", progress: 90, rating: 4.8 },
];

// ──── Mock Guides ────
export const mockGuides: Guide[] = [
  { id: "g1", name: "Dr. Sharma", email: "sharma@university.edu", avatar: "DS", department: "Computer Science", specialization: ["AI/ML", "Data Science"], assignedStudents: 3 },
  { id: "g2", name: "Prof. Gupta", email: "gupta@university.edu", avatar: "PG", department: "Information Technology", specialization: ["Mobile Dev", "Cloud Computing"], assignedStudents: 2 },
  { id: "g3", name: "Dr. Kumar", email: "kumar@university.edu", avatar: "DK", department: "Computer Science", specialization: ["Web Dev", "Database Systems"], assignedStudents: 1 },
];

// ──── Mock Teams ────
export const mockTeams: Team[] = [
  { id: "t1", name: "Team Alpha", members: ["s1", "s2"], projectId: "p1" },
  { id: "t2", name: "Team Beta", members: ["s4", "s6"], projectId: "p3" },
];

// ──── Mock Project Ideas ────
export const mockIdeas: ProjectIdea[] = [
  { id: "i1", title: "AI-Powered Campus Navigation System", abstract: "An intelligent navigation system using computer vision and indoor mapping to help students navigate large campuses.", problemStatement: "Students often struggle to find classrooms, labs, and offices in large university campuses.", techStack: ["React", "Python", "TensorFlow", "OpenCV"], expectedOutcome: "A mobile-responsive web app with real-time indoor navigation and AR overlays.", status: "approved", studentId: "s1", studentName: "Aarav Patel", submittedAt: "2026-01-15", updatedAt: "2026-01-28", guideFeedback: "Excellent concept! Approved. Focus on the indoor mapping accuracy." },
  { id: "i2", title: "Smart Attendance System using Face Recognition", abstract: "Automated attendance tracking using facial recognition to eliminate proxy attendance.", problemStatement: "Manual attendance is time-consuming and prone to proxy marking.", techStack: ["Java", "Spring Boot", "OpenCV", "MySQL"], expectedOutcome: "A web application with facial recognition-based attendance marking and analytics dashboard.", status: "under-review", studentId: "s2", studentName: "Priya Singh", submittedAt: "2026-01-20", updatedAt: "2026-01-20" },
  { id: "i3", title: "Blockchain-Based Certificate Verification", abstract: "A decentralized system for issuing and verifying academic certificates using blockchain.", problemStatement: "Certificate fraud is a growing issue. Traditional verification is slow and unreliable.", techStack: ["Node.js", "Solidity", "React", "Ethereum"], expectedOutcome: "A platform where institutions can issue tamper-proof digital certificates.", status: "submitted", studentId: "s3", studentName: "Rahul Verma", submittedAt: "2026-02-01", updatedAt: "2026-02-01" },
  { id: "i4", title: "IoT-Based Smart Classroom", abstract: "An IoT solution to automate classroom environment controls like lighting, AC, and projectors.", problemStatement: "Classrooms waste energy when equipment is left running in empty rooms.", techStack: ["Arduino", "Raspberry Pi", "MQTT", "React"], expectedOutcome: "A dashboard to monitor and control classroom IoT devices remotely.", status: "rejected", studentId: "s5", studentName: "Vikram Joshi", guideFeedback: "The scope is too broad. Please narrow down to a specific automation aspect and resubmit.", submittedAt: "2026-01-10", updatedAt: "2026-01-18" },
  { id: "i5", title: "Peer-to-Peer Study Material Sharing Platform", abstract: "A collaborative platform for students to share and rate study materials.", problemStatement: "Students lack a centralized platform to share curated study resources.", techStack: ["React", "Firebase", "Node.js"], expectedOutcome: "A web app with material upload, rating system, and personalized recommendations.", status: "draft", studentId: "s4", studentName: "Sneha Reddy", submittedAt: "2026-02-05", updatedAt: "2026-02-05" },
  { id: "i6", title: "Mental Health Support Chatbot for Students", abstract: "An AI-driven chatbot providing mental health resources and preliminary support to students.", problemStatement: "Many students face mental health challenges but hesitate to seek in-person help.", techStack: ["Python", "NLP", "React", "PostgreSQL"], expectedOutcome: "A conversational chatbot with resource recommendations and anonymous mood tracking.", status: "approved", studentId: "s6", studentName: "Ananya Desai", guideFeedback: "Well-researched proposal. Approved with minor revisions to the privacy section.", submittedAt: "2026-01-22", updatedAt: "2026-02-02" },
];

// ──── Mock Notifications ────
export const mockNotifications: Notification[] = [
  { id: "n1", title: "Idea Approved", message: "Your project idea 'AI-Powered Campus Navigation' has been approved!", type: "success", read: false, createdAt: "2026-02-10T10:30:00" },
  { id: "n2", title: "New Feedback", message: "Dr. Sharma has left feedback on your project.", type: "info", read: false, createdAt: "2026-02-09T14:00:00" },
  { id: "n3", title: "Deadline Approaching", message: "Project milestone 2 is due in 3 days.", type: "warning", read: true, createdAt: "2026-02-08T09:00:00" },
  { id: "n4", title: "Idea Rejected", message: "Your idea 'IoT-Based Smart Classroom' needs modifications.", type: "error", read: true, createdAt: "2026-01-18T16:00:00" },
];

// ──── Mock Doubt Threads ────
export const mockDoubts: DoubtThread[] = [
  {
    id: "d1", studentId: "s1", studentName: "Aarav Patel", guideId: "g1", guideName: "Dr. Sharma",
    subject: "Dataset for campus navigation",
    messages: [
      { sender: "Aarav Patel", text: "Sir, could you suggest a dataset for indoor mapping?", timestamp: "2026-02-08T10:00:00" },
      { sender: "Dr. Sharma", text: "Look into the IndoorAtlas dataset or create your own using LiDAR scans.", timestamp: "2026-02-08T11:30:00" },
      { sender: "Aarav Patel", text: "Thank you! I'll explore IndoorAtlas first.", timestamp: "2026-02-08T12:00:00" },
    ],
    resolved: false,
  },
  {
    id: "d2", studentId: "s3", studentName: "Rahul Verma", guideId: "g2", guideName: "Prof. Gupta",
    subject: "Blockchain consensus mechanism choice",
    messages: [
      { sender: "Rahul Verma", text: "Should I use Proof of Work or Proof of Stake for certificate verification?", timestamp: "2026-02-06T09:00:00" },
      { sender: "Prof. Gupta", text: "For your use case, Proof of Authority would be more suitable since it's a permissioned network.", timestamp: "2026-02-06T10:15:00" },
    ],
    resolved: true,
  },
];

// ──── Admin Stats ────
export const adminStats = {
  totalStudents: 6,
  totalGuides: 3,
  totalTeams: 2,
  totalIdeas: 6,
  approvedIdeas: 2,
  activeProjects: 2,
  pendingReviews: 2,
  rejectedIdeas: 1,
};
