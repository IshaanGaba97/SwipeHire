// ===== ENUMS =====

export enum UserRole {
    CANDIDATE = 'CANDIDATE',
    RECRUITER = 'RECRUITER',
    ADMIN = 'ADMIN',
}

export enum WorkType {
    REMOTE = 'REMOTE',
    HYBRID = 'HYBRID',
    ONSITE = 'ONSITE',
}

export enum ApplicationStatus {
    APPLIED = 'APPLIED',
    VIEWED = 'VIEWED',
    SHORTLISTED = 'SHORTLISTED',
    INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
    REJECTED = 'REJECTED',
    OFFER_RECEIVED = 'OFFER_RECEIVED',
}

export enum SwipeDirection {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    SUPER = 'SUPER',
}

export enum NotificationType {
    PROFILE_VIEWED = 'PROFILE_VIEWED',
    SHORTLISTED = 'SHORTLISTED',
    INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
    NEW_MESSAGE = 'NEW_MESSAGE',
    APPLICATION_UPDATE = 'APPLICATION_UPDATE',
}

// ===== USER =====

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    email: string;
    password: string;
    name: string;
    role: UserRole;
}

// ===== CANDIDATE PROFILE =====

export interface CandidateProfile {
    id: string;
    userId: string;
    headline?: string;
    summary?: string;
    skills: string[];
    experience: WorkExperience[];
    education: Education[];
    resumeUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    locationPreference?: string;
    salaryExpectation?: number;
    aiSummary?: string;
    user?: User;
}

export interface WorkExperience {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
}

export interface Education {
    degree: string;
    institution: string;
    year: number;
    field: string;
}

// ===== COMPANY =====

export interface Company {
    id: string;
    name: string;
    logo?: string;
    website?: string;
    description?: string;
    verified: boolean;
    recruiterId: string;
}

// ===== JOB =====

export interface Job {
    id: string;
    title: string;
    description: string;
    companyId: string;
    company?: Company;
    skills: string[];
    salaryMin?: number;
    salaryMax?: number;
    location: string;
    workType: WorkType;
    experienceMin?: number;
    experienceMax?: number;
    active: boolean;
    createdAt: string;
    matchScore?: number;
}

export interface CreateJobRequest {
    title: string;
    description: string;
    companyId: string;
    skills: string[];
    salaryMin?: number;
    salaryMax?: number;
    location: string;
    workType: WorkType;
    experienceMin?: number;
    experienceMax?: number;
}

// ===== APPLICATION =====

export interface Application {
    id: string;
    jobId: string;
    candidateId: string;
    status: ApplicationStatus;
    appliedAt: string;
    job?: Job;
    candidate?: CandidateProfile;
}

// ===== SWIPE =====

export interface Swipe {
    id: string;
    userId: string;
    targetId: string;
    targetType: 'JOB' | 'CANDIDATE';
    direction: SwipeDirection;
    createdAt: string;
}

// ===== MESSAGE =====

export interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    fileUrl?: string;
    read: boolean;
    createdAt: string;
    sender?: User;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    unreadCount: number;
}

// ===== INTERVIEW =====

export interface Interview {
    id: string;
    jobId: string;
    candidateId: string;
    questions: InterviewQuestion[];
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    overallScore?: number;
    aiSummary?: string;
    createdAt: string;
}

export interface InterviewQuestion {
    id: string;
    question: string;
    answer?: string;
    score?: number;
    feedback?: string;
    category: 'TECHNICAL' | 'COMMUNICATION' | 'PROBLEM_SOLVING';
}

// ===== NOTIFICATION =====

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    content: string;
    read: boolean;
    createdAt: string;
}

// ===== API =====

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}
