import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";

module {
  type WorkExperience = {
    company : Text;
    role : Text;
    durationMonths : Nat;
  };

  type Education = {
    degree : Text;
    institution : Text;
    graduationYear : Int;
  };

  type SkillLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  type SkillCategory = {
    #technical;
    #softSkills;
  };

  type Skill = {
    name : Text;
    level : SkillLevel;
    category : SkillCategory;
  };

  type JobRole = {
    title : Text;
    description : Text;
    requiredSkills : [Skill];
  };

  type Resume = {
    user : Principal;
    fileId : Text;
    blob : Storage.ExternalBlob;
    uploadTimestamp : Time.Time;
    experiences : ?[WorkExperience];
    skills : ?[Skill];
    education : ?[Education];
    recommendations : ?[Text];
  };

  type UserProfile = {
    name : Text;
    contact : ?Text;
    email : ?Text;
    isComplete : Bool;
    totalSkills : ?Nat;
    education : ?Text;
    experience : ?Text;
  };

  type ResumeData = {
    name : Text;
    contactInfo : ?Text;
    skills : ?[Text];
    workExperience : ?[WorkExperience];
    education : ?[Education];
    yearsOfExperience : Nat;
    certifications : ?[Text];
  };

  type OldActor = {
    jobRoles : Map.Map<Text, JobRole>;
    resumes : Map.Map<Principal, List.List<Resume>>;
    resumeDataMap : Map.Map<Principal, ResumeData>;
    userProfiles : Map.Map<Principal, UserProfile>;
    initialized : Bool;
  };

  type NewActor = {
    jobRoles : Map.Map<Text, JobRole>;
    resumes : Map.Map<Principal, List.List<Resume>>;
    resumeDataMap : Map.Map<Principal, ResumeData>;
    userProfiles : Map.Map<Principal, UserProfile>;
    initialized : Bool;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
