import { configureStore } from "@reduxjs/toolkit";
import treeReducer from "../Slices/treeSlice";

// Create and export Redux store
export default configureStore({
  reducer: {
    trees: treeReducer, // Register tree reducer under 'trees' slice
  },
});
