import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import Learning from "../models/learning.model.js";
import Subscription from "../models/subscription.model.js";
import { Content } from "../models/content.model.js";
import Review from "../models/review.model.js";

//------------------------Dashboard------------------------

// Get Dashboard Stats
const getDashboardStats = async (req, res, next) => {
  try {
    const studentsCount = await User.countDocuments({ role: "student" });
    const instructorsCount = await User.countDocuments({ role: "instructor" });
    const usersCount = studentsCount + instructorsCount;
    const coursesCount = await Content.countDocuments({
      contentType: "course",
    });
    const bootcampsCount = await Content.countDocuments({
      contentType: "bootcamp",
    });
    const contentCount = coursesCount + bootcampsCount;

    const students = await User.find({ role: "student" })
      .select("-password")
      .limit(10);
    const instructors = await User.find({ role: "instructor" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(10);

    // Most students in learning
    const topStudentsByLearning = await Learning.aggregate([
      {
        $group: {
          _id: "$user",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: {
          path: "$student",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          studentId: "$_id",
          name: "$student.name",
          email: "$student.email",
          count: 1,
        },
      },
    ]);

    // Most popular instructors that students learn from them
    const popularInstructors = await Learning.aggregate([
      {
        $lookup: {
          from: "contents",
          localField: "content",
          foreignField: "_id",
          as: "contentDoc",
        },
      },
      {
        $unwind: {
          path: "$contentDoc",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$contentDoc.instructor",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "instructor",
        },
      },
      {
        $unwind: {
          path: "$instructor",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          instructorId: "$_id",
          name: "$instructor.name",
          email: "$instructor.email",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "تم جلب إحصائيات لوحة التحكم بنجاح",
      data: {
        contentCount,
        coursesCount,
        bootcampsCount,
        usersCount,
        studentsCount,
        instructorsCount,
        students,
        instructors,
        topStudentsByLearning,
        popularInstructors,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return next(new ApiError("حدث خطأ اثناء جلب إحصائيات لوحة التحكم", 500));
  }
};

// Get Dashboard Analytics
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const coursesCount = await Content.countDocuments({
      contentType: "course",
    });
    const bootcampsCount = await Content.countDocuments({
      contentType: "bootcamp",
    });
    const contentCount = coursesCount + bootcampsCount;

    const studentsCount = await User.countDocuments({ role: "student" });
    const instructorsCount = await User.countDocuments({ role: "instructor" });
    const usersCount = studentsCount + instructorsCount;

    const popularCategories = await Content.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$category.name",
          slug: "$category.slug",
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      message: "تم جلب تحليلات لوحة التحكم بنجاح",
      data: {
        contentCount,
        coursesCount,
        bootcampsCount,
        usersCount,
        studentsCount,
        instructorsCount,
        popularCategories,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return next(new ApiError("حدث خطأ اثناء جلب تحليلات لوحة التحكم", 500));
  }
};

//------------------------Users------------------------

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

//------------------------Content------------------------

// Get All Content (Admin Only)
const getAllContent = async (req, res, next) => {
  try {
    const { contentType } = req.query || {};
    const content = await Content.find(
      contentType ? { contentType } : {},
    ).lean();

    res.status(200).json({
      status: "success",
      message: "تم جلب جميع المحتوى بنجاح",
      length: content.length,
      data: content,
    });
  } catch (error) {
    console.error("Error fetching all content:", error);
    return next(
      new ApiError(`Error fetching all content: ${error.message}`, 500),
    );
  }
};

// Get Content By ID (Admin Only)
const getContentById = async (req, res, next) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId).lean();
    if (!content) return next(new ApiError("Content not found", 404));

    const [contentLearning, contentRating] = await Promise.all([
      Learning.find({ content: contentId }).lean(),
      Review.find({ content: contentId }).lean(),
    ]);

    const studentsMap = {};

    // Seed map with learning data (status + progress)
    // learn.user is already populated via Learning model middleware
    contentLearning.forEach((learn) => {
      if (learn.user.isSubscribed) {
        const userId = learn.user._id.toString();
        studentsMap[userId] = {
          _id: learn.user._id,
          name: learn.user.name,
          email: learn.user.email,
          status: learn.status,
          progress: learn.progress,
          rating: null,
          review: null,
        };
      }
    });

    // Merge review data into existing entries, or add new entries for review-only users
    // review.user is already populated via Review model middleware
    contentRating.forEach((review) => {
      if (review.user.isSubscribed) {
        const userId = review.user._id.toString();
        if (studentsMap[userId]) {
          studentsMap[userId].rating = review.rating;
          studentsMap[userId].review = review.review;
        } else {
          studentsMap[userId] = {
            _id: review.user._id,
            name: review.user.name,
            email: review.user.email,
            status: null,
            progress: null,
            rating: review.rating,
            review: review.review,
          };
        }
      }
    });

    const students = Object.values(studentsMap);
    const totalStudents = students.length;
    const totalCompletedStudents = contentLearning.filter(
      (learn) => learn.status === "completed" && learn.user.isSubscribed,
    ).length;
    const totalInProgressStudents = contentLearning.filter(
      (learn) => learn.status === "in-progress" && learn.user.isSubscribed,
    ).length;

    res.status(200).json({
      status: "success",
      message: "تم جلب المحتوى بنجاح",
      data: {
        totalStudents,
        totalCompletedStudents,
        totalInProgressStudents,
        content,
        students,
      },
    });
  } catch (error) {
    console.error("Error fetching content by ID:", error);
    return next(new ApiError(`Error fetching content: ${error.message}`, 500));
  }
};

export {
  getAllUsers,
  toggleUserIsActive,
  createUser,
  getUserById,
  getAllContent,
  getContentById,
  getDashboardStats,
  getDashboardAnalytics,
};
