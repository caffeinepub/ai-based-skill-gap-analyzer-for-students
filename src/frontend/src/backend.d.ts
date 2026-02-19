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
export interface JobRole {
    title: string;
    requiredSkills: Array<Skill>;
}
export interface Skill {
    name: string;
    level: SkillLevel;
    category: SkillCategory;
}
export interface Resume {
    blob: ExternalBlob;
    user: Principal;
    fileId: string;
}
export interface UserProfile {
    name: string;
    education?: string;
    email?: string;
    experience?: string;
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
    addJobRole(title: string, requiredSkills: Array<Skill>): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerResume(): Promise<Resume | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobRoles(): Promise<Array<JobRole>>;
    getResume(user: Principal): Promise<Resume | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeJobRole(title: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateJobRole(title: string, requiredSkills: Array<Skill>): Promise<void>;
    uploadResume(fileId: string, blob: ExternalBlob): Promise<void>;
}
