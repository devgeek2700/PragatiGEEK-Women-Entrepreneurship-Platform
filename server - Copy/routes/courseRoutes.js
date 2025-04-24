import { Router } from 'express'
import { addLecturesToCourse, createCourse, deleteCourse, deleteLectures, getAllCourses, getLectures, updateCourse, updateLectures, getMyCourses, getEnrolledCourses, getSubscribedCourses, getAdminCourses } from '../controllers/courseController.js'
import { authorizedRole, isLoggedIn, verifySubscription, verifyCourseAccess } from "../middleware/authMiddleware.js";
import upload from '../middleware/multer.js'
const router = Router()

router.get('/', isLoggedIn, getAllCourses)
router.get('/all', isLoggedIn, getAllCourses)
router.get('/admin-courses', isLoggedIn, authorizedRole('ADMIN'), getAdminCourses)
router.get('/enrolled', isLoggedIn, getEnrolledCourses)
router.get('/my-courses', isLoggedIn, getMyCourses)
router.get('/subscribed', isLoggedIn, getSubscribedCourses)
router.post('/newcourse', isLoggedIn, authorizedRole('ADMIN'), upload.single("thumbnail"), createCourse)
router.get("/:id", isLoggedIn, getLectures)
router.put('/:id', isLoggedIn, authorizedRole('ADMIN'), upload.single("thumbnail"), updateCourse)
router.delete('/:id', isLoggedIn, authorizedRole('ADMIN'), deleteCourse)
router.post('/:id', isLoggedIn, authorizedRole('ADMIN'), upload.single("lecture"), addLecturesToCourse)
router.put('/lectures/:id/:lectureId', isLoggedIn, authorizedRole('ADMIN'), upload.single("lecture"), updateLectures)
router.delete('/lectures/:id/:lectureId', isLoggedIn, authorizedRole('ADMIN'), deleteLectures)

export default router