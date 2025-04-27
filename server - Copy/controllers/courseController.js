import Course from "../models/courseModel.js";
import createError from "../utils/error.js";
import { v2 } from "cloudinary";
import fs from "fs/promises";
import { myCache } from "../app.js";
import { Payment } from "../models/paymentModel.js";
import User from "../models/userModel.js";
import { isUserEnrolled } from "../utils/courseUtils.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Get user ID if logged in
    let courses;

    if (myCache.has("courses")) {
      courses = JSON.parse(myCache.get("courses"));
    } else {
      courses = await Course.find({}).select("-lectures").lean();
      if (!courses) {
        return next(createError(404, "No courses found"));
      }
      myCache.set("courses", JSON.stringify(courses));
    }

    // For logged-in users, add an isEnrolled flag to each course
    if (userId) {
      const payments = await Payment.find({
        user: userId,
        status: "succeeded",
        order_type: "course",
      });

      // Create a set of enrolled course IDs
      const enrolledCourseIds = new Set(
        payments.map((payment) => payment.course_id.toString())
      );

      // Add isEnrolled flag to each course
      courses = courses.map((course) => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course._id.toString()),
      }));
    }

    res.status(200).json({
      success: true,
      message: "All courses retrieved successfully",
      courses,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const getAdminCourses = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Only admin users can access this endpoint
    if (userRole !== "ADMIN") {
      return next(
        createError(403, "Only admin users can access this endpoint")
      );
    }

    let courses;

    // Get courses created by this admin
    courses = await Course.find({ createdBy: userId }).select("-lectures");

    if (!courses || courses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No courses created by this admin",
        courses: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin's created courses",
      courses,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, price } = req.body;

    const createdBy = req.user?.id;

    // Enhanced validation
    const validationErrors = [];

    if (!title) {
      validationErrors.push("Title is required");
    } else if (title.length < 8) {
      validationErrors.push("Title must be at least 8 characters");
    } else if (title.length > 100) {
      validationErrors.push("Title should be less than 100 characters");
    }

    if (!description) {
      validationErrors.push("Description is required");
    } else if (description.length < 20) {
      validationErrors.push("Description must be at least 20 characters");
    } else if (description.length > 5000) {
      validationErrors.push("Description should be less than 5000 characters");
    }

    if (!category) {
      validationErrors.push("Category is required");
    }

    if (!createdBy) {
      validationErrors.push("Creator ID is required");
    }

    if (!price) {
      validationErrors.push("Price is required");
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      validationErrors.push("Price must be a positive number");
    }

    if (!req.file) {
      validationErrors.push("Course thumbnail is required");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Create new course object
    const newCourse = new Course({
      title,
      description,
      category,
      createdBy,
      price: Number(price),
      thumbnail: {
        public_id: title,
        secure_url: "http",
      },
    });

    // Upload thumbnail image
    if (req.file) {
      try {
        const result = await v2.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "lms",
        });
        if (result) {
          newCourse.thumbnail.public_id = result.public_id;
          newCourse.thumbnail.secure_url = result.secure_url;
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(
          createError(500, "Thumbnail upload failed: " + (error.message || ""))
        );
      }
    }

    // Save course to database
    await newCourse.save();

    // Clear cache
    myCache.del("courses");

    // Return success response
    res.status(201).json({
      success: true,
      message: "Course created successfully",
      newCourse,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return next(createError(500, error.message || "Failed to create course"));
  }
};

export const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true,
        new: true,
      }
    );
    if (req.file) {
      try {
        await v2.uploader.destroy(course.thumbnail.public_id, {
          resource_type: "image",
        });
        const result = await v2.uploader.upload(req.file.path, {
          resource_type: "image",
          folder: "lms",
        });
        if (result) {
          course.thumbnail.public_id = result.public_id;
          course.thumbnail.secure_url = result.secure_url;
          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(createError(500, error.message || "file upload failed"));
      }
    }
    if (!course) {
      return next(createError(404, "No courses found"));
    }
    await course.save();
    myCache.del("courses");
    res.status(200).json({
      success: true,
      message: "course updated successfully",
      course,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return next(createError(404, "No courses found"));
    }
    await v2.uploader.destroy(course.thumbnail.public_id, {
      resource_type: "image",
    });
    myCache.del("courses");
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const getLectures = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const course = await Course.findById(id);
    if (!course) {
      return next(createError(404, "No course found"));
    }

    // If user is an admin, allow access regardless of enrollment
    if (userRole === "ADMIN") {
      console.log("Admin access granted for course:", id);
      return res.status(200).json({
        success: true,
        message: "Course lectures fetched successfully (Admin access)",
        lectures: course.lectures,
        courseDetails: {
          title: course.title,
          description: course.description,
          numberOfLectures: course.numberOfLectures,
          thumbnail: course.thumbnail,
        },
      });
    }

    // For non-admin users, check enrollment
    const isEnrolled = await isUserEnrolled(userId, id);
    console.log(
      "User enrollment check for course:",
      id,
      "User:",
      userId,
      "Result:",
      isEnrolled
    );

    // If user is not enrolled, return error
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "Please subscribe to access this resource",
      });
    }

    // User is enrolled, return course with lectures
    return res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      lectures: course.lectures,
      courseDetails: {
        title: course.title,
        description: course.description,
        numberOfLectures: course.numberOfLectures,
        thumbnail: course.thumbnail,
      },
    });
  } catch (error) {
    console.error("Error in getLectures:", error);
    return next(createError(500, error.message));
  }
};

export const addLecturesToCourse = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return next(createError(400, "Please enter all input fields"));
    }
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) {
      return next(createError(404, "No course found"));
    }
    const lectureData = {
      title,
      description,
      lecture: {
        public_id: title,
        secure_url: "http",
      },
    };
    if (req.file) {
      try {
        const result = await v2.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "lms",
        });
        if (result) {
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;

          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(createError(500, error.message || "file upload failed"));
      }
    }

    course.lectures.push(lectureData);
    course.numberOfLectures = course.lectures.length;
    await course.save();
    myCache.del("lectures");
    res.status(200).json({
      success: true,
      message: "lectures add successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const updateLectures = async (req, res, next) => {
  try {
    const { id, lectureId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return next(createError(404, "No course found"));
    }

    const lectureToUpdate = course.lectures.find(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
    if (!lectureToUpdate) {
      return next(createError(404, "No lecture found"));
    }

    if (req.body.title) {
      lectureToUpdate.title = req.body.title;
    }
    if (req.body.description) {
      lectureToUpdate.description = req.body.description;
    }
    if (req.file) {
      try {
        await v2.uploader.destroy(lectureToUpdate.lecture.public_id, {
          resource_type: "video",
        });
        const result = await v2.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "lms",
        });
        if (result) {
          lectureToUpdate.lecture.public_id = result.public_id;
          lectureToUpdate.lecture.secure_url = result.secure_url;

          fs.rm(`uploads/${req.file.filename}`);
        }
      } catch (error) {
        return next(createError(500, error.message || "file upload failed"));
      }
    }
    await course.save();
    myCache.del("lectures");
    res.status(200).json({
      success: true,
      message: "Lecture updated successfully",
      course: course.lectures,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const deleteLectures = async (req, res, next) => {
  try {
    const { id, lectureId } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return next(createError(404, "No course found"));
    }

    const lectureIndex = course.lectures.findIndex(
      (lecture) => lecture._id.toString() === lectureId.toString()
    );
    if (lectureIndex === -1) {
      return next(createError(404, "No lecture found"));
    }
    await v2.uploader.destroy(course.lectures[lectureIndex].lecture.public_id, {
      resource_type: "video",
    });

    course.lectures.splice(lectureIndex, 1);
    course.numberOfLectures = course.lectures.length;

    await course.save();
    myCache.del("lectures");
    res.status(200).json({
      success: true,
      message: "Lecture deleted successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const getMyCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    // Find all successful payments for this user and populate course details
    const payments = await Payment.find({
      user: userId,
      status: "succeeded",
      order_type: "course",
    }).populate({
      path: "course_id",
      select:
        "title description category thumbnail numberOfLectures createdBy price rating numberOfRatings",
    });

    // Add debug logging
    console.log("User ID:", userId);
    console.log("Found payments:", payments.length);

    // Check if we have any payments
    if (!payments.length) {
      return res.status(200).json({
        success: true,
        message: "No purchased courses found",
        courses: [],
      });
    }

    // Filter out any null course_id entries and get unique courses
    const purchasedCourses = [
      ...new Map(
        payments
          .filter((payment) => payment.course_id) // Filter out null course_id
          .map((payment) => [
            payment.course_id._id.toString(),
            payment.course_id,
          ])
      ).values(),
    ];

    res.status(200).json({
      success: true,
      message: "User's purchased courses fetched successfully",
      courses: purchasedCourses,
    });
  } catch (error) {
    console.error("Error in getMyCourses:", error);
    return next(createError(500, error.message));
  }
};

export const getEnrolledCourses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find the user with their subscriptions
    const user = await User.findById(userId).select("subscriptions");
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Get active subscription course IDs
    const activeCourseIds = user.subscriptions
      .filter((sub) => sub.status === "active")
      .map((sub) => sub.courseId.toString());

    console.log("Active subscription course IDs:", activeCourseIds);

    // Find all successful payments for this user
    const payments = await Payment.find({
      user: userId,
      status: { $in: ["succeeded", "successful"] },
      order_type: "course",
    }).populate({
      path: "course_id",
      select: "-lectures",
    });

    console.log("Found payment records:", payments.length);

    // Extract unique courses from payments and add isEnrolled flag
    const enrolledCoursesFromPayments = payments
      .filter((payment) => payment.course_id)
      .map((payment) => ({
        ...payment.course_id.toObject(),
        isEnrolled: true,
        enrollmentType: "payment",
      }));

    // Get courses from active subscriptions that are not in payment records
    const subscriptionCourseIds = activeCourseIds.filter(
      (courseId) =>
        !enrolledCoursesFromPayments.some(
          (course) => course._id.toString() === courseId
        )
    );

    let enrolledCoursesFromSubscriptions = [];
    if (subscriptionCourseIds.length > 0) {
      const subscriptionCourses = await Course.find({
        _id: { $in: subscriptionCourseIds },
      }).select("-lectures");

      enrolledCoursesFromSubscriptions = subscriptionCourses.map((course) => ({
        ...course.toObject(),
        isEnrolled: true,
        enrollmentType: "subscription",
      }));
    }

    // Combine both sources and ensure uniqueness
    const allEnrolledCourses = [
      ...enrolledCoursesFromPayments,
      ...enrolledCoursesFromSubscriptions,
    ];

    // Ensure uniqueness by courseId
    const uniqueEnrolledCourses = [
      ...new Map(
        allEnrolledCourses.map((course) => [course._id.toString(), course])
      ).values(),
    ];

    res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully",
      count: uniqueEnrolledCourses.length,
      courses: uniqueEnrolledCourses,
    });
  } catch (error) {
    console.error("Error in getEnrolledCourses:", error);
    return next(createError(500, error.message));
  }
};

export const getSubscribedCourses = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;

    // Find all courses where the user is subscribed
    const subscribedCourses = await Course.find({
      subscribers: userId,
    }).select("-lectures");

    // Return the courses
    res.status(200).json({
      success: true,
      message: "Subscribed courses fetched successfully",
      courses: subscribedCourses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribed courses",
      error: error.message,
    });
  }
};
