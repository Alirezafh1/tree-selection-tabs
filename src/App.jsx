// // imports for with conext:
import { TreeSelectionProvider } from "./components/TreesWithContext/TreeTabsWithContext";
import TreeTabsWithContext from "./components/TreesWithContext/TreeTabsWithContext";


// // imports for with redux:
// import { Provider } from "react-redux";
// import  store  from "../src/redux/Store/store.jsx";
// import TreeTabsWithRedux from "./components/TreesWithRedux/TreeTabsWithRedux";

function App() {
  return (

    // // Context section:
    <>
      <TreeSelectionProvider>
        <TreeTabsWithContext />
      </TreeSelectionProvider>
    </>


    // // Redux section:
    // <>
    //   <Provider store={store}>
    //     <TreeTabsWithRedux />
    //   </Provider>
    // </>
  );
}

export default App;
