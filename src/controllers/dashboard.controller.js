import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import Learning from "../models/learning.model.js";
import Subscription from "../models/subscription.model.js";

// Get All User Profiles
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").lean();

    res.status(200).json({
      status: "success",
      message: "تم جلب جميع الملفات الشخصية بنجاح",
      length: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllProfiles:", error);
    return next(new ApiError("حدث خطأ اثناء جلب جميع الملفات الشخصية", 500));
  }
};

// Toggle User isActive Status (Admin Only)
const toggleUserIsActive = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("isActive");
    if (!user) return next(new ApiError("User not found", 404));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: !user.isActive },
      { returnDocument: "after", select: "-password" },
    ).lean();

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error toggling user active status:", error);
    return next(
      new ApiError(`Error toggling user active: ${error.message}`, 500),
    );
  }
};

// Create Student (Admin Only)
const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      bio,
      links,
      languages,
      skills,
      education,
      experience,
      projects,
    } = req.body;

    const user = await User.findOne({ email });
    if (user) return next(new ApiError("User already exists", 400));

    let linksDate = [];
    let languagesDate = [];
    let skillsDate = [];
    let educationDate = [];
    let experienceDate = [];
    let projectsDate = [];

    linksDate = links?.map((link) => ({
      name: link.name.toLowerCase(),
      url: link.url.toLowerCase(),
    }));

    languagesDate = languages?.map((lang) => ({
      language: lang.language.toLowerCase(),
      proficiency: lang.proficiency.toLowerCase(),
    }));

    skillsDate = skills?.map((skill) => skill.toLowerCase());

    educationDate = education?.map((edu) => ({
      institution: edu.institution.toLowerCase(),
      degree: edu.degree.toLowerCase(),
      major: edu.major.toLowerCase(),
      startDate: edu.startDate,
      endDate: edu.endDate,
      description: edu.description.toLowerCase(),
      isCurrent: edu.isCurrent,
    }));

    experienceDate = experience?.map((exp) => ({
      company: exp.company.toLowerCase(),
      country: exp.country.toLowerCase(),
      city: exp.city.toLowerCase(),
      jobTitle: exp.jobTitle.toLowerCase(),
      jobType: exp.jobType.toLowerCase(),
      jobStyle: exp.jobStyle.toLowerCase(),
      startDate: exp.startDate,
      endDate: exp.endDate,
      skills: exp.skills.map((skill) => skill.toLowerCase()),
      description: exp.description.toLowerCase(),
      isCurrent: exp.isCurrent,
    }));

    projectsDate = projects?.map((project) => ({
      title: project.title.toLowerCase(),
      description: project.description.toLowerCase(),
      roleInProject: project.roleInProject.toLowerCase(),
      skillsUsed: project.skillsUsed.map((skill) => skill.toLowerCase()),
      startDate: project.startDate,
      endDate: project.endDate,
      projectImageUrls: project.projectImageUrls,
    }));

    const student = await User.create({
      name,
      email,
      password,
      phone,
      languages: languagesDate,
      bio,
      links: linksDate,
      skills: skillsDate,
      education: educationDate,
      experience: experienceDate,
      studentDetails: {
        projects: projectsDate,
      },

      role: "student",
    });

    res.status(201).json({
      status: "success",
      message: "تم إنشاء الطالب بنجاح",
      data: student,
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return next(new ApiError(`Error creating student: ${error.message}`, 500));
  }
};

// Get All Students (Admin Only)
const getAllStudents = async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" })
      .select("-password")
      .lean();

    res.status(200).json({
      status: "success",
      message: "تم جلب جميع الطلاب بنجاح",
      length: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return next(new ApiError(`Error fetching students: ${error.message}`, 500));
  }
};

// Get Student By ID with Learning and Subscription (Admin Only)
const getStudentById = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId).select("-password").lean();
    if (!student) return next(new ApiError("Student not found", 404));

    const learning = await Learning.findOne({ student: studentId }).lean();
    const subscription = await Subscription.findOne({
      student: studentId,
    }).lean();

    res.status(200).json({
      status: "success",
      message: "تم جلب بيانات الطالب بنجاح",
      data: {
        student,
        learning,
        subscription,
      },
    });
  } catch (error) {
    console.error("Error fetching student by ID:", error);
    return next(new ApiError(`Error fetching student: ${error.message}`, 500));
  }
};

export {
  // Users
  getAllUsers,
  toggleUserIsActive,

  // Students
  createStudent,
  getAllStudents,
  getStudentById,
};
