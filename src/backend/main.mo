import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Migration "migration";

// Apply migration if needed
(with migration = Migration.run)
actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data Types
  public type SkillLevel = {
    #beginner;
    #intermediate;
    #advanced;
  };

  public type SkillCategory = {
    #technical;
    #softSkills;
  };

  public type Skill = {
    name : Text;
    level : SkillLevel;
    category : SkillCategory;
  };

  public type JobRole = {
    title : Text;
    requiredSkills : [Skill];
  };

  public type Resume = {
    user : Principal;
    fileId : Text;
    blob : Storage.ExternalBlob;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
    education : ?Text;
    experience : ?Text;
  };

  module JobRole {
    public func compare(role1 : JobRole, role2 : JobRole) : Order.Order {
      role1.title.compare(role2.title);
    };
  };

  // Persistent State
  let jobRoles = Map.empty<Text, JobRole>();
  let resumes = Map.empty<Principal, Resume>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var initialized = false;

  // Initialization (Default Job Roles)
  func initializeDefaultJobRoles() {
    let defaultJobRoles : [JobRole] = [
      // Data Analyst
      {
        title = "Data Analyst";
        requiredSkills = [
          { name = "SQL"; level = #advanced; category = #technical },
          { name = "Python"; level = #advanced; category = #technical },
          { name = "Excel"; level = #beginner; category = #technical },
          { name = "Statistics"; level = #intermediate; category = #technical },
          { name = "Data Visualization"; level = #advanced; category = #technical },
          { name = "Power BI"; level = #beginner; category = #technical },
          { name = "Tableau"; level = #beginner; category = #technical },
        ];
      },
      // Web Developer
      {
        title = "Web Developer";
        requiredSkills = [
          { name = "HTML"; level = #intermediate; category = #technical },
          { name = "CSS"; level = #intermediate; category = #technical },
          { name = "JavaScript"; level = #intermediate; category = #technical },
          { name = "React"; level = #advanced; category = #technical },
          { name = "Node.js"; level = #advanced; category = #technical },
          { name = "Git"; level = #beginner; category = #technical },
          { name = "REST APIs"; level = #intermediate; category = #technical },
        ];
      },
      // AI Engineer
      {
        title = "AI Engineer";
        requiredSkills = [
          { name = "Python"; level = #advanced; category = #technical },
          { name = "Machine Learning"; level = #intermediate; category = #technical },
          { name = "TensorFlow"; level = #advanced; category = #technical },
          { name = "PyTorch"; level = #advanced; category = #technical },
          { name = "Deep Learning"; level = #intermediate; category = #technical },
          { name = "Natural Language Processing"; level = #beginner; category = #technical },
          { name = "Computer Vision"; level = #intermediate; category = #technical },
        ];
      },
      // DevOps Engineer
      {
        title = "DevOps Engineer";
        requiredSkills = [
          { name = "Linux"; level = #advanced; category = #technical },
          { name = "Docker"; level = #advanced; category = #technical },
          { name = "Kubernetes"; level = #intermediate; category = #technical },
          { name = "CI/CD"; level = #advanced; category = #technical },
          { name = "AWS"; level = #intermediate; category = #technical },
          { name = "Azure"; level = #intermediate; category = #technical },
          { name = "GCP"; level = #intermediate; category = #technical },
          { name = "Git"; level = #advanced; category = #technical },
          { name = "Bash scripting"; level = #intermediate; category = #technical },
        ];
      },
      // UI/UX Designer
      {
        title = "UI/UX Designer";
        requiredSkills = [
          { name = "Figma"; level = #advanced; category = #technical },
          { name = "Adobe XD"; level = #intermediate; category = #technical },
          { name = "User Research"; level = #intermediate; category = #technical },
          { name = "Wireframing"; level = #beginner; category = #technical },
          { name = "Prototyping"; level = #intermediate; category = #technical },
          { name = "Visual Design"; level = #intermediate; category = #technical },
          { name = "HTML/CSS basics"; level = #beginner; category = #technical },
        ];
      },
    ];

    for (jobRole in defaultJobRoles.values()) {
      jobRoles.add(jobRole.title, jobRole);
    };
    initialized := true;
  };

  func ensureInitialized() {
    if (not initialized and jobRoles.size() == 0) {
      initializeDefaultJobRoles();
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Job Role Management (Admin Only)
  public shared ({ caller }) func addJobRole(title : Text, requiredSkills : [Skill]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add job roles");
    };

    let jobRole = { title; requiredSkills };
    jobRoles.add(title, jobRole);
  };

  public shared ({ caller }) func updateJobRole(title : Text, requiredSkills : [Skill]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update job roles");
    };

    switch (jobRoles.get(title)) {
      case (null) { Runtime.trap("Job role does not exist") };
      case (?_) {
        let jobRole = { title; requiredSkills };
        jobRoles.add(title, jobRole);
      };
    };
  };

  public shared ({ caller }) func removeJobRole(title : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete job roles");
    };

    switch (jobRoles.get(title)) {
      case (null) { Runtime.trap("Job role does not exist") };
      case (?_) {
        jobRoles.remove(title);
      };
    };
  };

  public query ({ caller }) func getJobRoles() : async [JobRole] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view job roles");
    };
    ensureInitialized();
    jobRoles.values().toArray().sort();
  };

  // Resume Management
  public shared ({ caller }) func uploadResume(fileId : Text, blob : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can upload resumes");
    };

    // File validation logic handled in frontend with fileId and blob
    let resume = { user = caller; fileId; blob };
    resumes.add(caller, resume);
  };

  public query ({ caller }) func getResume(user : Principal) : async ?Resume {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own resume");
    };

    resumes.get(user);
  };

  public query ({ caller }) func getCallerResume() : async ?Resume {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access resumes");
    };

    resumes.get(caller);
  };
};
