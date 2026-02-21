import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Int "mo:core/Int";

import Nat64 "mo:core/Nat64";
import Float "mo:core/Float";


actor {
  // Mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Data Types and Comparisons
  public type WorkExperience = {
    company : Text;
    role : Text;
    durationMonths : Nat;
  };

  public type Education = {
    degree : Text;
    institution : Text;
    graduationYear : Int;
  };

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
    description : Text;
    requiredSkills : [Skill];
  };

  public type Resume = {
    user : Principal;
    fileId : Text;
    blob : Storage.ExternalBlob;
    uploadTimestamp : Time.Time;
    experiences : ?[WorkExperience];
    skills : ?[Skill];
    education : ?[Education];
    recommendations : ?[Text];
  };

  public type UserProfile = {
    name : Text;
    contact : ?Text;
    email : ?Text;
    isComplete : Bool;
    totalSkills : ?Nat;
    education : ?Text;
    experience : ?Text;
  };

  public type ResumeData = {
    name : Text;
    contactInfo : ?Text;
    skills : ?[Text];
    workExperience : ?[WorkExperience];
    education : ?[Education];
    yearsOfExperience : Nat;
    certifications : ?[Text];
  };

  public type ResumeScore = {
    totalScore : Nat;
    completenessScore : Nat;
    contentQualityScore : Nat;
    formattingScore : Nat;
    skillRelevanceScore : Nat;
    feedback : Text;
  };

  public type ComparisonMetrics = {
    overallScore : Float;
    experienceLevel : Float;
    educationCount : Nat;
    skillOverlap : Nat;
    certificationsCount : Nat;
  };

  public type ComparisonResult = {
    resumes : [ResumeData];
    metrics : [ComparisonMetrics];
  };

  module JobRole {
    public func compare(role1 : JobRole, role2 : JobRole) : Order.Order {
      role1.title.compare(role2.title);
    };
  };

  // Persistent State
  let jobRoles = Map.empty<Text, JobRole>();
  let resumes = Map.empty<Principal, List.List<Resume>>();
  let resumeDataMap = Map.empty<Principal, ResumeData>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var initialized = false;

  // Helper Functions
  func ensureInitialized() {
    if (not initialized and jobRoles.size() == 0) {
      initializeDefaultJobRoles();
    };
  };

  // Resume Comparison and Editing
  public shared ({ caller }) func compareResumes(
    principalIds : [Principal]
  ) : async ComparisonResult {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can compare resumes");
    };

    // Fetch resume data for all principal IDs
    let resumesToCompare = principalIds.map(
      func(_id) {
        let data = resumeDataMap.get(caller);
        switch (data) {
          case (null) {
            Runtime.trap("Resume data not found for one or more users");
          };
          case (?resumeData) {
            resumeData;
          };
        };
      }
    );

    // Calculate comparison metrics
    let metrics = resumesToCompare.map(
      func(resumeData) {
        let overallScore = calculateOverallScore(resumeData);
        let experienceLevel = calculateExperienceLevel(resumeData);
        let educationCount = calculateEducationCount(resumeData);
        let skillOverlap = calculateSkillOverlap(resumesToCompare, resumeData);
        let certificationsCount = calculateCertificationsCount(resumeData);

        {
          overallScore;
          experienceLevel;
          educationCount;
          skillOverlap;
          certificationsCount;
        };
      }
    );

    {
      resumes = resumesToCompare;
      metrics;
    };
  };

  public shared ({ caller }) func updateResumeData(updatedData : ResumeData) : async () {
    if (updatedData.name == "") {
      Runtime.trap("Name cannot be empty");
    };

    resumeDataMap.add(caller, updatedData);
  };

  // Helper Functions for comparison metrics
  func calculateOverallScore(resume : ResumeData) : Float {
    let experienceScore = if (resume.yearsOfExperience > 5) { 5.0 } else { resume.yearsOfExperience.toFloat() };
    let educationScore = switch (resume.education) {
      case (null) { 0.0 };
      case (?edu) {
        let degreeCount = edu.size();
        if (degreeCount > 3) { 3.0 } else { degreeCount.toFloat() };
      };
    };
    let certificationsScore = switch (resume.certifications) {
      case (null) { 0.0 };
      case (?certifications) {
        let certCount = certifications.size();
        if (certCount > 2) { 2.0 } else { certCount.toFloat() };
      };
    };
    let skillsScore = switch (resume.skills) {
      case (null) { 0.0 };
      case (?skills) {
        let skillCount = skills.size();
        if (skillCount > 10) { 10.0 } else { skillCount.toFloat() };
      };
    };

    let sum = experienceScore + educationScore + certificationsScore + skillsScore;
    sum / 4.0;
  };

  func calculateExperienceLevel(resume : ResumeData) : Float {
    if (resume.yearsOfExperience > 15) { 15.0 } else { resume.yearsOfExperience.toFloat() };
  };

  func calculateEducationCount(resume : ResumeData) : Nat {
    switch (resume.education) {
      case (null) { 0 };
      case (?edu) { edu.size() };
    };
  };

  func calculateSkillOverlap(resumesToCompare : [ResumeData], currentResume : ResumeData) : Nat {
    var overlapCount = 0;

    switch (currentResume.skills) {
      case (null) {};
      case (?currentSkills) {
        for (resume in resumesToCompare.values()) {
          switch (resume.skills) {
            case (null) {};
            case (?comparedSkills) {
              for (skill in currentSkills.values()) {
                for (comparedSkill in comparedSkills.values()) {
                  if (skill == comparedSkill) {
                    overlapCount += 1;
                  };
                };
              };
            };
          };
        };
      };
    };

    overlapCount;
  };

  func calculateCertificationsCount(resume : ResumeData) : Nat {
    switch (resume.certifications) {
      case (null) { 0 };
      case (?certifications) { certifications.size() };
    };
  };

  // Rest of the code (same as initial implementation)
  public shared ({ caller }) func validateResume(
    experiences : ?[WorkExperience],
    skills : ?[Skill],
    education : ?[Education],
  ) : async Bool {
    switch (experiences) {
      case (null) {
        Runtime.trap("Experiences cannot be null");
      };
      case (?expArray) {
        if (expArray.size() == 0) { Runtime.trap("Invalid experience section") };
      };
    };

    switch (skills) {
      case (null) {
        Runtime.trap("Skills cannot be null");
      };
      case (?skillArray) {
        if (skillArray.size() == 0) { return false };
        let hasTechnical = skillArray.find(func(skill) { skill.category == #technical });
        if (hasTechnical == null) { return false };
      };
    };

    switch (education) {
      case (null) {
        Runtime.trap("Education cannot be null");
      };
      case (?eduArray) {
        if (eduArray.size() == 0) { return false };
      };
    };

    true;
  };

  // Administrators and users can analyze resume quality
  public shared ({ caller }) func analyzeResume(
    completenessScore : Nat,
    contentQualityScore : Nat,
    formattingScore : Nat,
    skillRelevanceScore : Nat,
    feedback : Text,
  ) : async ResumeScore {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users or admins can access resume scores");
    };
    calculateResumeScore(completenessScore, contentQualityScore, formattingScore, skillRelevanceScore, feedback);
  };

  func calculateResumeScore(
    completenessScore : Nat,
    contentQualityScore : Nat,
    formattingScore : Nat,
    skillRelevanceScore : Nat,
    feedback : Text,
  ) : ResumeScore {
    let totalScore = (completenessScore + contentQualityScore + formattingScore + skillRelevanceScore) / 4;
    {
      totalScore;
      completenessScore;
      contentQualityScore;
      formattingScore;
      skillRelevanceScore;
      feedback;
    };
  };

  // Initialization (Default Job Roles)
  func initializeDefaultJobRoles() {
    let defaultJobRoles : [JobRole] = [
      // Data Analyst
      {
        title = "Data Analyst";
        description = "Data Analysts interpret data and turn it into information which can offer ways to improve a business...";
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
        description = "Web Developers design, build, and maintain websites and web applications, focusing on both function and appearance...";
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
        description = "AI Engineers develop, test, and implement AI models, specializing in machine learning techniques to automate tasks and enhance data analysis.";
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
        description = "DevOps Engineers streamline software development and infrastructure operations by implementing automation tools and managing continuous integration and deployment systems.";
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
        description = "UI/UX Designers create visually appealing and user-friendly interfaces, ensuring optimal usability and engagement across digital products.";
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
      // AI Consultant
      {
        title = "AI Consultant";
        description = "AI Consultants provide expert guidance on implementing and optimizing AI solutions to advance business objectives and enhance digital transformation initiatives.";
        requiredSkills = [
          { name = "Machine Learning"; level = #advanced; category = #technical },
          { name = "Data Analysis"; level = #advanced; category = #technical },
          { name = "Project Management"; level = #intermediate; category = #technical },
          { name = "Python"; level = #intermediate; category = #technical },
          { name = "Consulting"; level = #advanced; category = #softSkills },
          { name = "Communication"; level = #advanced; category = #softSkills },
        ];
      },
    ];

    for (jobRole in defaultJobRoles.values()) {
      jobRoles.add(jobRole.title, jobRole);
    };
    initialized := true;
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
  public shared ({ caller }) func addJobRole(title : Text, description : Text, requiredSkills : [Skill]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add job roles");
    };

    let jobRole = { title; description; requiredSkills };
    jobRoles.add(title, jobRole);
  };

  public shared ({ caller }) func updateJobRole(title : Text, description : Text, requiredSkills : [Skill]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update job roles");
    };

    switch (jobRoles.get(title)) {
      case (null) { Runtime.trap("Job role does not exist") };
      case (?_) {
        let jobRole = { title; description; requiredSkills };
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

  // Public query - accessible to all users including guests
  // Job roles are general information that helps users understand requirements
  public query ({ caller }) func getJobRoles() : async [JobRole] {
    ensureInitialized();
    jobRoles.values().toArray().sort();
  };

  // Resume Management
  public shared ({ caller }) func uploadResume(
    documentId : Text,
    blob : Storage.ExternalBlob,
    experiences : [WorkExperience],
    skills : [Skill],
    education : [Education],
    recommendations : [Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can upload resumes");
    };

    if (experiences.size() == 0 or skills.size() == 0 or education.size() == 0) {
      Runtime.trap("Resume must have at least one experience, skill, and education entry");
    };

    let inMemoryResume : Resume = {
      user = caller;
      fileId = documentId;
      blob;
      uploadTimestamp = Time.now();
      experiences = ?experiences;
      skills = ?skills;
      education = ?education;
      recommendations = ?recommendations;
    };

    let userResumes = switch (resumes.get(caller)) {
      case (null) { List.empty<Resume>() };
      case (?existing) { existing };
    };
    userResumes.add(inMemoryResume);

    resumes.add(caller, userResumes);
  };

  public shared ({ caller }) func deleteResume(documentId : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can delete resumes");
    };

    switch (resumes.get(caller)) {
      case (null) {
        Runtime.trap("No resumes found for user");
      };
      case (?userResumes) {
        let initialSize = userResumes.size();

        let filteredResumes = userResumes.filter(
          func(resume) {
            resume.fileId != documentId;
          }
        );

        if (filteredResumes.size() == initialSize) {
          Runtime.trap("Resume with document ID " # documentId # " not found");
        };

        if (filteredResumes.isEmpty()) {
          resumes.remove(caller);
        } else {
          resumes.add(caller, filteredResumes);
        };
      };
    };
  };

  public query ({ caller }) func getResumes(user : Principal) : async [Resume] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own resumes");
    };

    switch (resumes.get(user)) {
      case (null) {
        Runtime.trap("No resumes found for user");
      };
      case (?userResumes) {
        userResumes.toArray();
      };
    };
  };

  public query ({ caller }) func getCallerResumes() : async [Resume] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access resumes");
    };

    switch (resumes.get(caller)) {
      case (null) { [] };
      case (?userResumes) {
        userResumes.toArray();
      };
    };
  };

  public query ({ caller }) func getResume(documentId : Text) : async ?Resume {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access resumes");
    };

    switch (resumes.get(caller)) {
      case (null) { null };
      case (?userResumes) {
        userResumes.find(func(resume) { resume.fileId == documentId });
      };
    };
  };

  public query ({ caller }) func getResumeData() : async ?ResumeData {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access resumes");
    };

    resumeDataMap.get(caller);
  };

  public shared ({ caller }) func setResumeData(
    name : Text,
    contactInfo : ?Text,
    skills : ?[Text],
    workExperience : ?[WorkExperience],
    education : ?[Education],
    yearsOfExperience : Nat,
    certifications : ?[Text],
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can upload resumes");
    };

    if (name.isEmpty()) {
      Runtime.trap("Name cannot be empty");
    };

    let resumeData : ResumeData = {
      name;
      contactInfo;
      skills;
      workExperience;
      education;
      yearsOfExperience;
      certifications;
    };

    resumeDataMap.add(caller, resumeData);
  };

  public shared ({ caller }) func calculateSkillGaps(documentId : Text, jobRole : Text) : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only registered users can access resumes");
    };

    switch (resumes.get(caller)) {
      case (null) { Runtime.trap("No resumes found for user") };
      case (?userResumes) {
        switch (userResumes.toArray().find(func(resume) { resume.fileId == documentId })) {
          case (null) { Runtime.trap("Resume not found") };
          case (?resume) {
            let resumeSkills = switch (resume.skills) {
              case (null) { [] };
              case (?s) { s };
            };
            let jobRoleDetails = switch (jobRoles.get(jobRole)) {
              case (null) { Runtime.trap("Job role does not exist") };
              case (?details) { details };
            };
            let requiredSkills = jobRoleDetails.requiredSkills;

            let resumeGapSkills = requiredSkills.filter(
              func(requiredSkill) {
                let hasSkill = resumeSkills.find(
                  func(skill) { skill.name == requiredSkill.name }
                );
                hasSkill == null;
              }
            );

            resumeGapSkills.map(func(skill) { skill.name });
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllSkills(user : Principal) : async [Skill] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own skills");
    };

    switch (resumes.get(user)) {
      case (null) {
        Runtime.trap("No resumes found for user");
      };
      case (?userResumes) {
        let allSkills = List.empty<Skill>();

        userResumes.toArray().forEach(
          func(resume) {
            switch (resume.skills) {
              case (null) {};
              case (?skills) {
                for (skill in skills.values()) {
                  allSkills.add(skill);
                };
              };
            };
          }
        );

        let skillsArray = allSkills.toArray();
        if (skillsArray.size() > 0) {
          skillsArray;
        } else { [] };
      };
    };
  };
};


