import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import Learning from "../models/learning.model.js";
import Subscription from "../models/subscription.model.js";
import { Content } from "../models/content.model.js";

// Create User (Admin Only)
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      bio,
      links,
      languages,
      skills,
      education,
      experience,
      studentDetails,
      instructorDetails,
    } = req.body;

    const user = await User.findOne({ email });
    if (user) return next(new ApiError("User already exists", 400));

    let linksDate = [];
    let languagesDate = [];
    let skillsDate = [];
    let educationDate = [];
    let experienceDate = [];

    let studentDetailsData = {};
    let instructorDetailsData = {};

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

    if (role === "student") {
      studentDetailsData = {
        projects: studentDetails.projects?.map((project) => ({
          title: project.title.toLowerCase(),
          description: project.description.toLowerCase(),
          roleInProject: project.roleInProject.toLowerCase(),
          skillsUsed: project.skillsUsed.map((skill) => skill.toLowerCase()),
          startDate: project.startDate,
          endDate: project.endDate,
          projectImageUrls: project.projectImageUrls,
        })),

        certificates: studentDetails.certificates?.map((certificate) => ({
          name: certificate.name.toLowerCase(),
          description: certificate.description.toLowerCase(),
          contentId: certificate.contentId,
          certificateUrl: certificate.certificateUrl,
          issuedAt: certificate.issuedAt,
        })),
      };
    } else if (role === "instructor") {
      instructorDetailsData = {
        teachingStyle: instructorDetails.teachingStyle.toLowerCase(),
        videoProfessionality:
          instructorDetails.videoProfessionality.toLowerCase(),
        targetAudience: instructorDetails.targetAudience.toLowerCase(),
        isVerified: instructorDetails.isVerified,
        verifiedAt: instructorDetails.verifiedAt,
      };
    }

    const student = await User.create({
      name,
      email,
      password,
      role: role,
      phone,
      languages: languagesDate,
      bio,
      links: linksDate,
      skills: skillsDate,
      education: educationDate,
      experience: experienceDate,
      studentDetails: studentDetailsData,
      instructorDetails: instructorDetailsData,
      otpIsVerified: true,
    });

    res.status(201).json({
      status: "success",
      message: "تم إنشاء المستخدم بنجاح",
      data: student,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return next(new ApiError(`Error creating user: ${error.message}`, 500));
  }
};

// Get All User Profiles
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query || {};
    const users = await User.find(role ? { role } : {})
      .select("-password")
      .lean();

    res.status(200).json({
      status: "success",
      message: "تم جلب جميع المستخدمين بنجاح",
      length: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return next(new ApiError("حدث خطأ اثناء جلب جميع المستخدمين", 500));
  }
};

// Get Student By ID with Learning and Subscription (Admin Only)
const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return next(new ApiError("User not found", 404));

    let data = {};

    if (user.role === "student") {
      const learning = await Learning.findOne({ user: userId }).lean();
      const subscription = await Subscription.findOne({
        user: userId,
      }).lean();

      data = {
        student: user,
        learning: {
          coursesLearning: learning?.filter((learn) => learn.type === "course"),
          bootcampsLearning: learning?.filter(
            (learn) => learn.type === "bootcamp",
          ),
        },
        subscriptions: {
          generalSubscription: subscription?.filter(
            (sub) => sub.type === "general",
          ),
          bootcampSubscription: subscription?.filter(
            (sub) => sub.type === "bootcamp",
          ),
        },
      };
    } else if (user.role === "instructor") {
      const content = await Content.find({ instructor: userId }).lean();

      data = {
        instructor: user,
        content: {
          courses: content?.filter((c) => c.contentType === "course"),
          bootcamps: content?.filter((c) => c.contentType === "bootcamp"),
        },
      };
    } else if (user.role === "admin") {
      data = {
        admin: user,
      };
    }

    res.status(200).json({
      status: "success",
      message: "تم جلب بيانات المستخدم بنجاح",
      data,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return next(new ApiError(`Error fetching user: ${error.message}`, 500));
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

export { getAllUsers, toggleUserIsActive, createUser, getUserById };
