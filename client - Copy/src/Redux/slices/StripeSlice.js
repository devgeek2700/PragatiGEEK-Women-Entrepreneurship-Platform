import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { toast } from 'react-toastify'

import axiosInstance from '../../helpers/AxiosInstance'

const initialState = {
    publishableKey: "",
    subscriptionId: "",
    allPayments: {},
    finalMonths: {},
    monthlySalesRecord: [],
    isLoading: false,
    error: null
}

export const getStripePublishableKey = createAsyncThunk("/stripe/getKey", async () => {
    try {
        const response = await axiosInstance.get('/payments/key');
        return response.data;
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to get Stripe key")
        throw error
    }
})

export const createSubscription = createAsyncThunk("/createSubscription", async () => {
    try {
        const response = await axiosInstance.post('/payments/subscribe')
        return response.data
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to create subscription")
        throw error
    }
})

export const verifySubscription = createAsyncThunk("/verifySubscription", async (data) => {
    try {
        toast.loading("Verifying payment...", {
            position: 'top-center'
        })
        const response = await axiosInstance.post('/payments/verify', {
            paymentMethodId: data.paymentMethodId
        })
        toast.dismiss();
        toast.success(response.data?.message || "Payment verified successfully")
        return response?.data
    } catch (error) {
        toast.dismiss()
        toast.error(error?.response?.data?.message || "Failed to verify payment")
        throw error
    }
})
export const getPaymentsRecord = createAsyncThunk("/paymentsRecord", async () => {
    try {
        toast.loading("Getting payments record", {
            position: 'top-center'
        })
        const response = await axiosInstance.get("/payments?count=100")
        toast.dismiss();
        if (response.status === 200) {
            toast.success(response.data.message || "Successfully retrieved payment records");
            return response.data;
        } else {
            throw new Error(response.data.message || "Failed to retrieve payment records");
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to retrieve payment records")
        throw error
    }
})

export const cancelSubscription = createAsyncThunk("/cancel/subscription", async () => {
    try {
        toast.loading("Cancelling subscription...", {
            position: 'top-center'
        })
        const response = await axiosInstance.post("/payments/unsubscribe")
        toast.dismiss();
        if (response.status === 200) {
            toast.success(response.data.message || "Subscription cancelled successfully");
            return response.data;
        } else {
            throw new Error(response.data.message || "Failed to cancel subscription");
        }
    } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to cancel subscription")
        throw error
    }
})

const stripeSlice = createSlice({
    name: "stripe",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getStripePublishableKey.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getStripePublishableKey.fulfilled, (state, action) => {
                state.isLoading = false;
                state.publishableKey = action.payload.key;
            })
            .addCase(getStripePublishableKey.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(createSubscription.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createSubscription.fulfilled, (state, action) => {
                state.isLoading = false;
                state.subscriptionId = action.payload.subscriptionId;
            })
            .addCase(createSubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(verifySubscription.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(verifySubscription.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(verifySubscription.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(getPaymentsRecord.fulfilled, (state, action) => {
                state.allPayments = action.payload.allPayments;
                state.finalMonths = action.payload.finalMonths;
                state.monthlySalesRecord = action.payload.monthlySalesRecord;
            })
    }
})

export default stripeSlice.reducer