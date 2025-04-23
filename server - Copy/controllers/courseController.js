import Course from "../models/courseModel.js";
import createError from "../utils/error.js";
import { v2 } from "cloudinary";
import fs from "fs/promises";
import { myCache } from "../app.js";
import { Payment } from "../models/paymentModel.js";
import User from "../models/userModel.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const userId = req.user?.id; // Get user ID if logged in
    let courses;

    if (myCache.has("courses")) {
      courses = JSON.parse(myCache.get("courses"));
    } else {
      courses = await Course.find({}).select("-lectures");
      if (!courses) {
        return next(createError(404, "No courses found"));
      }
      myCache.set("courses", JSON.stringify(courses));
    }

    // If user is logged in, check their enrolled courses and filter them out
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

      // Filter out enrolled courses
      courses = courses.filter(
        (course) => !enrolledCourseIds.has(course._id.toString())
      );
    }

    res.status(200).json({
      success: true,
      message: "All unenrolled courses",
      courses,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const { title, description, category, createdBy, price } = req.body;
    if (!title || !description || !category || !createdBy || !price) {
      return next(createError(400, "Please enter all input fields"));
    }
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

    try {
      await newCourse.validate();
    } catch (error) {
      const validationErrors = [];
      for (const key in error.errors) {
        validationErrors.push(error.errors[key].message);
      }
      return res
        .status(400)
        .json({ success: false, message: validationErrors.join(", ") });
    }

    if (!newCourse) {
      return next(createError(400, "course created failed"));
    }
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
        return next(createError(500, error.message || "file upload failed"));
      }
    }
    await newCourse.save();
    myCache.del("courses");
    res.status(201).json({
      success: true,
      message: "course created successfully",
      newCourse,
    });
  } catch (error) {
    return next(createError(500, error.message));
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

    // First verify if user is enrolled in this course
    const isEnrolled = await Payment.findOne({
      user: userId,
      course_id: id,
      status: "succeeded",
      order_type: "course",
    });

    const course = await Course.findById(id);
    if (!course) {
      return next(createError(404, "No course found"));
    }

    // Modified response
    return res.status(200).json({
      success: true,
      message: "Course data fetched successfully",
      lectures: course.lectures, // Send all lectures
      enrollmentStatus: isEnrolled ? "enrolled" : "not_enrolled",
    });
  } catch (error) {
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

    // Find all successful payments for this user
    const payments = await Payment.find({
      user: userId,
      status: "succeeded",
      order_type: "course",
    }).populate({
      path: "course_id",
      select: "-lectures",
    });

    // Extract unique courses and add isEnrolled flag
    const enrolledCourses = [
      ...new Map(
        payments
          .filter((payment) => payment.course_id)
          .map((payment) => [
            payment.course_id._id.toString(),
            {
              ...payment.course_id.toObject(),
              isEnrolled: true,
            },
          ])
      ).values(),
    ];

    res.status(200).json({
      success: true,
      message: "Enrolled courses fetched successfully",
      courses: enrolledCourses,
    });
  } catch (error) {
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
