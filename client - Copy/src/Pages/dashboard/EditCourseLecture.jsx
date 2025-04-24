import { useEffect, useState } from 'react'
import { FaArrowLeft, FaVideo, FaSave, FaTimes } from 'react-icons/fa';
import { RiVideoAddFill } from 'react-icons/ri';
import { BsPencilSquare } from 'react-icons/bs';
import { MdTitle, MdDescription } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { updateLecture } from '../../redux/slices/LectureSlice';
import HomeLayout from "../../layouts/HomeLayout";

function EditCourseLecture() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { state } = useLocation();
    const { id } = useParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isLoading } = useSelector(state => state.lecture);
    const [errors, setErrors] = useState({
        title: '',
        description: ''
    });

    useEffect(() => {
        if (!state) {
            navigate("/courses")
        }
        document.title = 'Edit lecture - Learning Management System'
    }, [])

    const [data, setData] = useState({
        cid: id,
        lectureId: state?._id,
        lecture: null,
        title: state?.title,
        description: state?.description,
        videoSrc: state?.lecture?.secure_url
    })

    function handleChange(e) {
        const { name, value } = e.target
        setData({ ...data, [name]: value })
        
        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    }

    const handleVideo = (e) => {
        const video = e.target.files[0];
        if (video) {
            if (video.size > 50 * 1024 * 1024) {
                toast.error("Video size must be less than 50MB");
                return;
            }
            
            const source = window.URL.createObjectURL(video);
            setData({
                ...data,
                lecture: video,
                videoSrc: source
            })
        }
    }

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        
        if (!data.title || data.title.trim().length < 3) {
            newErrors.title = "Title must be at least 3 characters long";
            isValid = false;
        }
        
        if (!data.description || data.description.trim().length < 10) {
            newErrors.description = "Description must be at least 10 characters long";
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const res = await dispatch(updateLecture(data));
            if (res?.payload?.success) {
                toast.success("Lecture updated successfully!");
                navigate(-1);
            }
        } catch (error) {
            toast.error("Failed to update lecture");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
            navigate(-1);
        }
    }

    return (
        <HomeLayout>
            <div className="min-h-screen bg-gray-900 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                            >
                                <FaArrowLeft /> Go Back
                            </button>
                            <h1 className="text-3xl font-bold text-white">Edit Lecture</h1>
                        </div>
                        <div className="text-sm text-gray-400">
                            Course ID: {id}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                        <div className="p-6 bg-gray-700 border-b border-gray-600">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <BsPencilSquare /> Edit Lecture Content
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                            {/* Video Preview Section */}
                            <div className="space-y-6">
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                        <FaVideo /> Video Preview
                                    </h3>
                                    
                                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                        {data.videoSrc ? (
                                            <video 
                                                key={data.videoSrc} 
                                                controls 
                                                controlsList="nodownload nofullscreen" 
                                                disablePictureInPicture 
                                                className="w-full h-full object-contain"
                                            >
                                                <source src={data.videoSrc} type="video/mp4" />
                                            </video>
                                        ) : (
                                            <div className="w-full h-full flex flex-col justify-center items-center bg-gray-800">
                                                <RiVideoAddFill size={80} className="text-gray-500 mb-2" />
                                                <p className="text-gray-400">No video selected</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <label className="block text-lg font-medium text-white mb-2">
                                        Upload New Video (Optional)
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="file" 
                                            name="lecture" 
                                            id="lecture" 
                                            accept="video/mp4" 
                                            onChange={handleVideo} 
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor="lecture" 
                                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg text-white cursor-pointer"
                                        >
                                            <RiVideoAddFill size={20} />
                                            {data.lecture ? "Change Video" : "Select Video"}
                                        </label>
                                        {data.lecture && (
                                            <p className="mt-2 text-sm text-gray-400">
                                                Selected: {data.lecture.name} ({Math.round(data.lecture.size / (1024 * 1024))}MB)
                                            </p>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Max file size: 50MB. Supported format: MP4
                                    </p>
                                </div>
                            </div>

                            {/* Lecture Details Section */}
                            <div className="space-y-6">
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <div className="mb-6">
                                        <label className="block text-lg font-medium text-white mb-2 flex items-center gap-2">
                                            <MdTitle /> Lecture Title
                                        </label>
                                        <input 
                                            type="text" 
                                            name="title" 
                                            id="title" 
                                            value={data.title || ''} 
                                            onChange={handleChange} 
                                            placeholder="Enter an informative title" 
                                            className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border ${errors.title ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500`}
                                        />
                                        {errors.title && (
                                            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-lg font-medium text-white mb-2 flex items-center gap-2">
                                            <MdDescription /> Lecture Description
                                        </label>
                                        <textarea 
                                            name="description" 
                                            id="description" 
                                            value={data.description || ''} 
                                            onChange={handleChange} 
                                            placeholder="Describe what students will learn in this lecture" 
                                            rows="6"
                                            className={`w-full px-4 py-3 rounded-lg bg-gray-800 text-white border ${errors.description ? 'border-red-500' : 'border-gray-600'} focus:outline-none focus:border-blue-500 resize-none`}
                                        ></textarea>
                                        {errors.description && (
                                            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-4">
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting || isLoading}
                                        className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 ${(isSubmitting || isLoading) ? 'bg-blue-800 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
                                    >
                                        {isSubmitting || isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={handleCancel}
                                        className="flex-1 py-3 px-6 rounded-lg font-semibold bg-gray-600 hover:bg-gray-700 text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </HomeLayout>
    )
}

export default EditCourseLecture
