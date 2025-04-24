import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

import axiosInstance from '../../helpers/AxiosInstance'

const initialState = {
    courseData: [],
    enrolledCourses: [],
    adminCourses: [],
    loading: false,
    error: null
}

export const getAllCourses = createAsyncThunk("/course/get", async () => {
    try {
        const response = await axiosInstance.get("/course");
        return response.data;
    } catch (error) {
        throw error;
    }
});

export const getAdminCourses = createAsyncThunk("/course/admin", async () => {
    try {
        const response = await axiosInstance.get("/course/admin-courses");
        return response.data;
    } catch (error) {
        throw error;
    }
});

export const getEnrolledCourses = createAsyncThunk("/course/enrolled", async () => {
    try {
        const response = await axiosInstance.get("/course/enrolled");
        return response.data;
    } catch (error) {
        throw error;
    }
});

export const createCourse = createAsyncThunk('/course/create', async (data) => {
    try {
        toast.loading("wait! creating course...", {
            position: 'top-center'
        })
        const response = await axiosInstance.post('/course/newcourse', data);
        if (response.status === 201) {
            toast.dismiss();
            toast.success(response.data.message);
            return response.data;
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message);
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})
export const updateCourse = createAsyncThunk('/course/update', async (data) => {
    try {
        toast.loading("wait! updating course...", {
            position: 'top-center'
        })
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("category", data.category);
        formData.append("createdBy", data.createdBy);
        if (data.thumbnail) {
            formData.append("thumbnail", data.thumbnail);
        }
        const response = await axiosInstance.put(`/course/${data.id}`, formData);
        if (response.status === 200) {
            toast.dismiss();
            toast.success(response.data.message);
            return response.data;
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message);
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})
export const deleteCourse = createAsyncThunk('/course/delete', async (id) => {
    try {
        toast.loading("wait! deleting course...", {
            position: 'top-center'
        })
        const response = await axiosInstance.delete(`/course/${id}`);
        if (response.status === 200) {
            toast.dismiss();
            toast.success(response.data.message);
            return response.data;
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message);
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})

const courseSlice = createSlice({
    name: "course",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.courseData = action.payload.courses;
            })
            .addCase(getAllCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(getEnrolledCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(getEnrolledCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.enrolledCourses = action.payload.courses;
            })
            .addCase(getEnrolledCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(getAdminCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAdminCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.adminCourses = action.payload.courses;
            })
            .addCase(getAdminCourses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(createCourse.fulfilled, (state, action) => {
                // Add the newly created course to admin courses
                if (action.payload.newCourse) {
                    state.adminCourses.push(action.payload.newCourse);
                }
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                // Update the course in admin courses array
                if (action.payload.course) {
                    const index = state.adminCourses.findIndex(
                        course => course._id === action.payload.course._id
                    );
                    if (index !== -1) {
                        state.adminCourses[index] = action.payload.course;
                    }
                }
            })
            .addCase(deleteCourse.fulfilled, (state, action) => {
                // Remove deleted course from admin courses array
                if (action.meta.arg) {
                    state.adminCourses = state.adminCourses.filter(
                        course => course._id !== action.meta.arg
                    );
                }
            });
    }
});

export default courseSlice.reducer