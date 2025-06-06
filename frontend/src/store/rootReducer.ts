import { combineReducers } from "@reduxjs/toolkit";
import dummyReducer from "./dummySlice";

const rootReducer = combineReducers({
  dummy: dummyReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
