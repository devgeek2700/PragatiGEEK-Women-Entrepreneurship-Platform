import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEnrolledCourses } from "../../redux/slices/CourseSlice";
import HomeLayout from "../../layouts/HomeLayout";
import CourseCard from "../../pages/course/CourseCard";

function EnrolledCourses() {
  const dispatch = useDispatch();
  const { enrolledCourses, loading } = useSelector((state) => state.course);

  useEffect(() => {
    dispatch(getEnrolledCourses());
  }, []);

  return (
    <HomeLayout>
      <div className="min-h-[90vh] pt-12 px-20">
        <h1 className="text-center text-3xl font-bold mb-8">
          My Enrolled Courses
        </h1>
        {loading ? (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {enrolledCourses?.length > 0 ? (
              enrolledCourses.map((course) => (
                <CourseCard key={course._id} data={course} isEnrolled={true} />
              ))
            ) : (
              <p className="text-center text-gray-500 text-xl">
                You haven't enrolled in any courses yet.
              </p>
            )}
          </div>
        )}
      </div>
    </HomeLayout>
  );
}

export default EnrolledCourses;
