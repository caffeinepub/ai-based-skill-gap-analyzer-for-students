import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Education {
    institution: string;
    graduationYear: bigint;
    degree: string;
}
export interface JobRole {
    title: string;
    description: string;
    requiredSkills: Array<Skill>;
}
export interface Skill {
    name: string;
    level: SkillLevel;
    category: SkillCategory;
}
export interface WorkExperience {
    role: string;
    durationMonths: bigint;
    company: string;
}
export interface Resume {
    blob: ExternalBlob;
    recommendations?: Array<string>;
    user: Principal;
    education?: Array<Education>;
    uploadTimestamp: Time;
    fileId: string;
    experiences?: Array<WorkExperience>;
    skills?: Array<Skill>;
}
export interface UserProfile {
    contact?: string;
    name: string;
    education?: string;
    email?: string;
    experience?: string;
    totalSkills?: bigint;
    isComplete: boolean;
}
export enum SkillCategory {
    technical = "technical",
    softSkills = "softSkills"
}
export enum SkillLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addJobRole(title: string, description: string, requiredSkills: Array<Skill>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateSkillGaps(documentId: string, jobRole: string): Promise<Array<string>>;
    deleteResume(documentId: string): Promise<void>;
    getAllSkills(user: Principal): Promise<Array<Skill>>;
    getCallerResumes(): Promise<Array<Resume>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobRoles(): Promise<Array<JobRole>>;
    getResume(documentId: string): Promise<Resume | null>;
    getResumes(user: Principal): Promise<Array<Resume>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeJobRole(title: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateJobRole(title: string, description: string, requiredSkills: Array<Skill>): Promise<void>;
    uploadResume(documentId: string, blob: ExternalBlob, experiences: Array<WorkExperience>, skills: Array<Skill>, education: Array<Education>, recommendations: Array<string>): Promise<void>;
    validateResume(experiences: Array<WorkExperience> | null, skills: Array<Skill> | null, education: Array<Education> | null): Promise<boolean>;
}
