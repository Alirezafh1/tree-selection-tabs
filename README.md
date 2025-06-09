
# Tree Tabs Component with Selection Management

This repository contains a React component that renders two tree views inside tabs, allowing multi-level node selection with parent-child selection propagation, keyboard navigation, and synchronized selection states. The component is implemented in two versions:

1. **Context API Version** — Uses React Context for state management.
2. **Redux Version** — Uses Redux Toolkit slice for state management.

---

## Features

- Two separate trees with hierarchical data.
- Multi-select with automatic parent-child selection/deselection logic.
- Keyboard navigation support (arrow keys and space for selection).
- Tab-based UI to switch between trees and view selections.
- Selection summary displayed in a TreeSelect component.
- Accessible keyboard focus handling on tab change.
- Context and Redux implementations for state management.

---

## Context API Version

### Overview

- Uses a `TreeSelectionContext` created with React Context API.
- `TreeSelectionProvider` wraps the tree tabs component and provides `selections` state and setter to all children.
- The hook `useTreeSelection` enables consuming components to access and update selection state.
- Local component state manages expanded nodes and active nodes for keyboard navigation.
- All selection logic (select/deselect with parent-child propagation) is handled inside the main component.

### Usage

Wrap your app (or relevant component subtree) with:

```jsx
import { TreeSelectionProvider } from "./TreeSelectionProvider";

<TreeSelectionProvider>
  <TreeTabsWithContext />
</TreeSelectionProvider>
```

### Pros

- Simple and lightweight without external dependencies.
- Easy to understand and integrate for small to medium complexity state sharing.

---

## Redux Version

### Overview

- State is managed globally using Redux Toolkit slice.
- `treeSelectionSlice` contains selection arrays for each tree.
- The component dispatches Redux actions to update selections.
- The rest of the UI logic (keyboard navigation, expansion) remains local state.
- Enables centralized state management, useful for larger apps.

### Usage

Set up Redux store with:

```js
import { configureStore } from "@reduxjs/toolkit";
import treeSelectionReducer from "./treeSelectionSlice";

const store = configureStore({
  reducer: {
    treeSelection: treeSelectionReducer,
  },
});
```

Wrap your app with Redux Provider:

```jsx
import { Provider } from "react-redux";

<Provider store={store}>
  <TreeTabsWithRedux />
</Provider>
```

### Pros

- Scalable for large apps with complex state requirements.
- Easy to debug and track changes using Redux DevTools.
- Centralized state allows sharing across distant components.

---

## Common Implementation Details

- Data structures are similar for both trees with nested `title` and `key` fields.
- Selection logic handles selecting/deselecting nodes recursively including children and parents.
- Keyboard handlers support arrow keys to move active focus and space key to toggle selection.
- Tabs show Tree 1, Tree 2, and a summary tab listing selections using Ant Design `TreeSelect`.
- Styling highlights the active focused node for better UX.

---

## Running the Example

1. Install dependencies:

```bash
npm install
```

2. Run the app:

```bash
npm run dev
```

---

## Dependencies

- React 18+
- Ant Design 5+
- Redux Toolkit (for Redux version)
- React Redux (for Redux version)

---

## License

MIT License

---

## Contact

For questions or feedback, feel free to reach out.

---
