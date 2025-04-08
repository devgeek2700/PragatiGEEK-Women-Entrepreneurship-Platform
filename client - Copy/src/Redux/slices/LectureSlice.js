import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { toast } from 'react-toastify'

import axiosInstance from '../../helpers/AxiosInstance'

const initialState = {
    lectures: [],
    enrollmentStatus: null,
    isLoading: false,
    error: null
}

export const getLectures = createAsyncThunk("/course/lecture", async (cid) => {
    try {
        toast.loading("Wait! fetching lectures", {
            position: 'top-center'
        })
        const response = await axiosInstance.get(`/course/${cid}`);
        if (response.status === 200) {
            toast.dismiss();
            toast.success(response.data.message);
            return response?.data
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message)
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})
export const addLecture = createAsyncThunk("/course/lecture/add", async (data) => {
    try {
        toast.loading("Wait! adding lecture", {
            position: 'top-center'
        })
        const formData = new FormData();
        formData.append("lecture", data.lecture);
        formData.append("title", data.title);
        formData.append("description", data.description)
        const response = await axiosInstance.post(`/course/${data.cid}`, formData);
        if (response.status === 200) {
            toast.dismiss();
            toast.success(response.data.message);
            return response?.data
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message)
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})
export const updateLecture = createAsyncThunk("/course/lecture/update", async (data) => {
    try {
        toast.loading("Wait! updating lecture", {
            position: 'top-center'
        })
        const formData = new FormData();
        formData.append("lecture", data.lecture);
        formData.append("title", data.title);
        formData.append("description", data.description)
        const response = await axiosInstance.put(`/course/lectures/${data.cid}/${data.lectureId}`, formData);
        if (response.status === 200) {
            toast.dismiss();
            toast.success(response.data.message);
            return response?.data
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message)
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})
export const deleteLecture = createAsyncThunk("/course/lecture/delete", async (data) => {
    try {
        toast.loading("Wait! deleting lecture", {
            position: 'top-center'
        })
        const response = await axiosInstance.delete(`/course/lectures/${data.cid}/${data.lectureId}`);
        if (response.status === 200) {
            toast.dismiss();
            toast.success(response.data.message);
            return response?.data
        } else {
            toast.dismiss();
            toast.error(response.data.message);
            throw new Error(response.data.message)
        }
    } catch (error) {
        toast.dismiss();
        toast.error(error?.response?.data?.message);
        throw error;
    }
})

const lectureSlice = createSlice({
    name: 'lecture',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getLectures.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getLectures.fulfilled, (state, action) => {
                state.lectures = action.payload.lectures;
                state.enrollmentStatus = action.payload.enrollmentStatus;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(getLectures.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(addLecture.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addLecture.fulfilled, (state, action) => {
                state.lectures = action.payload.lectures;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(addLecture.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(updateLecture.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateLecture.fulfilled, (state, action) => {
                state.lectures = action.payload.lectures;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(updateLecture.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(deleteLecture.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteLecture.fulfilled, (state, action) => {
                state.lectures = action.payload.lectures;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(deleteLecture.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
})

export default lectureSlice.reducer