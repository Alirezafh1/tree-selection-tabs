import { createSlice } from "@reduxjs/toolkit";

// Define tree slice of Redux state
export const treeSlice = createSlice({
  name: "trees", // Slice name
  initialState: {
    tree1: {
      expandedKeys: [],
      checkedKeys: [],
      activeKey: null,
    },
    tree2: {
      expandedKeys: [],
      checkedKeys: [],
      activeKey: null,
    },
  },
  reducers: {
    // Update state of tree1
    updateTree1State: (state, action) => {
      state.tree1 = { ...state.tree1, ...action.payload };
    },
    // Update state of tree2
    updateTree2State: (state, action) => {
      state.tree2 = { ...state.tree2, ...action.payload };
    },
  },
});

// Export actions for dispatching
export const { updateTree1State, updateTree2State } = treeSlice.actions;
// Export reducer for store
export default treeSlice.reducer;
