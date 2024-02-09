import { createSlice } from '@reduxjs/toolkit'

export const weatherSlice = createSlice({
    name: 'weather',
    initialState: {
        value: {}
    },
    reducers: {
        setWeather: (state, action) => {
            state.value = action.payload;
        }
    }
});

export const { setWeather } = weatherSlice.actions;

export default weatherSlice.reducer;