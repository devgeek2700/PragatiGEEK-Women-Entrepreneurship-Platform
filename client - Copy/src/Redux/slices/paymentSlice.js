import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    paymentData: null,
    paymentType: null
};

const paymentSlice = createSlice({
    name: 'payment',
    initialState,
    reducers: {
        setPaymentData: (state, action) => {
            state.paymentData = action.payload.order;
            state.paymentType = action.payload.type;
        },
        clearPaymentData: (state) => {
            state.paymentData = null;
            state.paymentType = null;
        }
    }
});

export const { setPaymentData, clearPaymentData } = paymentSlice.actions;
export default paymentSlice.reducer; 