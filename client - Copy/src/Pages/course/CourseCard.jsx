import { useNavigate } from "react-router-dom";

function CourseCard({ data, isEnrolled }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/course/description`, { state: { ...data, isEnrolled } })}
      className="card w-96 bg-white border rounded-lg border-gray-300 cursor-pointer"
    >
      <figure>
        <img
          src={data.thumbnail?.secure_url}
          alt="course thumbnail"
          className="w-full h-60 object-cover rounded-t-lg"
        />
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-xl text-gray-800 font-semibold">
          {data.title}
          {isEnrolled ? (
            <span className="badge badge-success text-xs ml-2">ENROLLED</span>
          ) : (
            <span className="badge badge-primary text-xs ml-2">NEW</span>
          )}
        </h2>
        <p className="font-medium text-gray-600">
          Instructor: <span className="text-blue-600">{data.createdBy}</span>
        </p>
        <p className="font-medium text-gray-600">
          Lectures:{" "}
          <span className="text-blue-600">{data.numberOfLectures}</span>
        </p>
        <div className="card-actions justify-end">
          <div className="badge badge-outline capitalize py-2 px-3 border-blue-400 border-2 text-blue-600">
            {data.category}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
