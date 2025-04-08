import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllCourses, getEnrolledCourses } from '../../redux/slices/CourseSlice'
import HomeLayout from '../../layouts/HomeLayout'
import CourseCard from './CourseCard'

function CourseList() {
    const dispatch = useDispatch()
    const { courseData, enrolledCourses, loading } = useSelector((state) => state.course)
    const [activeTab, setActiveTab] = useState('all')
    const { isLoggedIn } = useSelector((state) => state.auth)

    useEffect(() => {
        dispatch(getAllCourses())
        if (isLoggedIn) {
            dispatch(getEnrolledCourses())
        }
    }, [])

    return (
        <HomeLayout>
            <div className='min-h-[90vh] pt-12 px-20'>
                <h1 className='text-center text-3xl font-bold mb-8'>
                    Explore Our Courses
                </h1>

                {/* Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="tabs tabs-boxed">
                        <button 
                            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Courses
                        </button>
                        {isLoggedIn && (
                            <button 
                                className={`tab ${activeTab === 'enrolled' ? 'tab-active' : ''}`}
                                onClick={() => setActiveTab('enrolled')}
                            >
                                My Enrolled Courses
                            </button>
                        )}
                    </div>
                </div>

                {/* Content based on active tab */}
                {loading ? (
                    <div className="flex justify-center">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : (
                    <div className='flex flex-wrap gap-8 justify-center'>
                        {activeTab === 'all' ? (
                            courseData?.length > 0 ? (
                                courseData.map((course) => {
                                    // Check if course exists in enrolledCourses
                                    const isEnrolled = enrolledCourses?.some(
                                        (enrolledCourse) => enrolledCourse._id === course._id
                                    );
                                    return (
                                        <CourseCard 
                                            key={course._id} 
                                            data={course}
                                            isEnrolled={isEnrolled}
                                        />
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-500 text-xl">
                                    No courses available.
                                </p>
                            )
                        ) : (
                            enrolledCourses?.length > 0 ? (
                                enrolledCourses.map((course) => (
                                    <CourseCard 
                                        key={course._id} 
                                        data={course}
                                        isEnrolled={true} 
                                    />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-xl">
                                    You haven't enrolled in any courses yet.
                                </p>
                            )
                        )}
                    </div>
                )}
            </div>
        </HomeLayout>
    )
}

export default CourseList
