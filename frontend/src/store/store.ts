import commerceReducer from "./slices/commerceSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    commerce: commerceReducer,
  },
});