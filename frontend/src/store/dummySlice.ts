import { createSlice } from "@reduxjs/toolkit";

const dummySlice = createSlice({
  name: "dummy",
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
  },
});

export const { increment, decrement } = dummySlice.actions;
export default dummySlice.reducer;
