import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { Tabs, Tree, TreeSelect } from "antd";

// create Context for selections
const TreeSelectionContext = createContext();

// Provider Component
export const TreeSelectionProvider = ({ children }) => {
  const [selections, setSelections] = useState({
    tree1: [],
    tree2: [],
  });

  return (
    <TreeSelectionContext.Provider value={{ selections, setSelections }}>
      {/* <TreeTabsWithContext /> تبدیل به children میشه و داخل Provider رندر میشه. */}
      {/* برای مشخص کردن اینکه کدام کامپوننت‌ها باید به context دسترسی داشته باشن */}

      {children}
    </TreeSelectionContext.Provider>
  );
};

// Hook to access context values
export const useTreeSelection = () => {
  const context = useContext(TreeSelectionContext);
  if (!context) {
    // این ارور میخواد مطمان بشه که کامپوننتی که داره از این هوک استفاده میکنه خارج از تری سلکشن پرووایدر قرار نگرفته باشه
    // یه ارور پرتاب می‌کنه تا به دولوپر هشدار بده که داره از هوک در جای اشتباهی استفاده می‌کنه
    // ممکنه دولوپر متوجه نشه که باگ داره و کدش بدون دلیل کار نکنه و دیباگ کردن سخت تر میشه براش اگر این ارور چک کننده نباشه
    // ارور چک کننده Guard Clause
    throw new Error(
      "useTreeSelection must be used within a TreeSelectionProvider"
    );
  }
  return context;
};

// Main component
const TreeTabsWithContext = () => {
  const { selections, setSelections } = useTreeSelection();

  // Data for Tree 1
  const treeData1 = [
    {
      title: "Parent 1",
      key: "0-0",
      children: [
        {
          title: "Child 1-1",
          key: "0-0-0",
          children: [
            { title: "Grandchild 1-1-1", key: "0-0-0-0" },
            { title: "Grandchild 1-1-2", key: "0-0-0-1" },
          ],
        },
        { title: "Child 1-2", key: "0-0-1" },
      ],
    },
    {
      title: "Parent 2",
      key: "0-1",
      children: [
        { title: "Child 2-1", key: "0-1-0" },
        { title: "Child 2-2", key: "0-1-1" },
      ],
    },
  ];

  // Data for Tree 2
  const treeData2 = [
    {
      title: "Node A",
      key: "a-0",
      children: [
        { title: "Node A-1", key: "a-0-0" },
        { title: "Node A-2", key: "a-0-1" },
      ],
    },
    {
      title: "Node B",
      key: "b-0",
      children: [
        { title: "Node B-1", key: "b-0-0" },
        { title: "Node B-2", key: "b-0-1" },
      ],
    },
  ];

  // States
  const [treeStates, setTreeStates] = useState({
    tree1: { expandedKeys: [], activeKey: null },
    tree2: { expandedKeys: [], activeKey: null },
  });

  // Current selected tab
  const [activeTab, setActiveTab] = useState("1");

  // Refs
  const treeRefs = {
    tree1: useRef(null),
    tree2: useRef(null),
  };

  // Auto-focus when tab changes
  useEffect(() => {
    const refKey = activeTab === "1" ? "tree1" : "tree2";
    setTimeout(() => {
      if (treeRefs[refKey].current) {
        treeRefs[refKey].current.focus();
      }
    }, 0);
  }, [activeTab]);

  // Get all child keys
  const getAllChildKeys = (node) => {
    let keys = [];
    if (node.children) {
      node.children.forEach((child) => {
        keys.push(child.key);
        keys = keys.concat(getAllChildKeys(child));
      });
    }
    return keys;
  };

  // Get all parent keys
  const getAllParentKeys = (treeData, targetKey) => {
    const findParents = (nodes, path = []) => {
      for (let node of nodes) {
        if (node.key === targetKey) {
          return path;
        }
        if (node.children) {
          const result = findParents(node.children, [...path, node.key]);
          if (result) return result;
        }
      }
      return null;
    };

    return findParents(treeData) || [];
  };

  // Convert tree to flat list
  const flattenTree = (treeNodes, expandedKeys) => {
    const result = [];

    const flatten = (nodes) => {
      nodes.forEach((node) => {
        result.push(node);
        if (expandedKeys.includes(node.key) && node.children) {
          flatten(node.children);
        }
      });
    };

    flatten(treeNodes);
    return result;
  };

  // Recursively find tree node
  const findNodeByKey = (nodes, key) => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle selection change (for both mouse and keyboard)
  const handleSelectionChange = (treeName, key) => {
    const treeData = treeName === "tree1" ? treeData1 : treeData2;
    const node = findNodeByKey(treeData, key);
    const currentSelections = selections[treeName];

    // Get all child keys if node has children
    const allChildKeys = node?.children ? getAllChildKeys(node) : [];

    // Check if the node is currently selected
    const isSelected = currentSelections.includes(key);

    let newSelectedKeys;

    if (isSelected) {
      // Deselect the node and all its children
      newSelectedKeys = currentSelections.filter(
        (k) => k !== key && !allChildKeys.includes(k)
      );

      // Also deselect all parents if needed
      const parentKeys = getAllParentKeys(treeData, key);
      parentKeys.forEach((parentKey) => {
        const parentNode = findNodeByKey(treeData, parentKey);
        const parentChildKeys = getAllChildKeys(parentNode);
        const allChildrenSelected = parentChildKeys.every((k) =>
          newSelectedKeys.includes(k)
        );
        if (!allChildrenSelected) {
          newSelectedKeys = newSelectedKeys.filter((k) => k !== parentKey);
        }
      });
    } else {
      // Select the node and all its children
      newSelectedKeys = [...currentSelections, key, ...allChildKeys];

      // Also select parents if all their children are now selected
      const parentKeys = getAllParentKeys(treeData, key);
      parentKeys.forEach((parentKey) => {
        const parentNode = findNodeByKey(treeData, parentKey);
        const parentChildKeys = getAllChildKeys(parentNode);
        const allChildrenSelected = parentChildKeys.every((k) =>
          newSelectedKeys.includes(k)
        );
        if (allChildrenSelected && !newSelectedKeys.includes(parentKey)) {
          newSelectedKeys.push(parentKey);
        }
      });
    }

    setSelections((prev) => ({
      ...prev,
      [treeName]: newSelectedKeys,
    }));
  };

  // Handle tree keyboard navigation
  const handleKeyDown = (e, treeName) => {
    const { expandedKeys, activeKey } = treeStates[treeName];
    const treeData = treeName === "tree1" ? treeData1 : treeData2;
    const flatNodes = flattenTree(treeData, expandedKeys);
    const activeIndex = flatNodes.findIndex((node) => node.key === activeKey);

    switch (e.key) {
      case "ArrowDown":
        if (activeKey) {
          const node = findNodeByKey(treeData, activeKey);
          if (node?.children && !expandedKeys.includes(activeKey)) {
            setTreeStates((prev) => ({
              ...prev,
              [treeName]: {
                ...prev[treeName],
                expandedKeys: [...prev[treeName].expandedKeys, activeKey],
                // activeKey: node.children[0].key, //optional
              },
            }));
          } else if (activeIndex < flatNodes.length - 1) {
            setTreeStates((prev) => ({
              ...prev,
              [treeName]: {
                ...prev[treeName],
                activeKey: flatNodes[activeIndex + 1].key,
              },
            }));
          }
        } else if (flatNodes.length > 0) {
          setTreeStates((prev) => ({
            ...prev,
            [treeName]: {
              ...prev[treeName],
              activeKey: flatNodes[0].key,
            },
          }));
        }
        break;

      case "ArrowUp":
        if (activeIndex > 0) {
          setTreeStates((prev) => ({
            ...prev,
            [treeName]: {
              ...prev[treeName],
              activeKey: flatNodes[activeIndex - 1].key,
            },
          }));
        }
        break;

      case "ArrowRight":
        if (activeKey) {
          const node = findNodeByKey(treeData, activeKey);
          if (node.children && !expandedKeys.includes(activeKey)) {
            setTreeStates((prev) => ({
              ...prev,
              [treeName]: {
                ...prev[treeName],
                expandedKeys: [...prev[treeName].expandedKeys, activeKey],
              },
            }));
          }
        }
        break;

      case "ArrowLeft":
        if (activeKey && expandedKeys.includes(activeKey)) {
          setTreeStates((prev) => ({
            ...prev,
            [treeName]: {
              ...prev[treeName],
              expandedKeys: prev[treeName].expandedKeys.filter(
                (key) => key !== activeKey
              ),
            },
          }));
        }
        break;

      case " ":
        e.preventDefault();
        if (activeKey) {
          handleSelectionChange(treeName, activeKey);
          setTreeStates((prev) => ({
            ...prev,
            [treeName]: {
              ...prev[treeName],
              activeKey,
            },
          }));
        }
        break;

      default:
        break;
    }
  };

  // Convert selected keys to TreeSelect data
  const selectedKeysToTreeData = (selectedKeys, treeData) => {
    return selectedKeys.map((key) => {
      const node = findNodeByKey(treeData, key);
      return {
        title: node?.title || key,
        value: key,
        key: key,
      };
    });
  };

  // Define tab content
  const tabItems = [
    {
      key: "1",
      label: "Tree 1",
      children: (
        <div
          ref={treeRefs.tree1}
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, "tree1")}
          style={{ outline: "none" }}
        >
          <Tree
            treeData={treeData1}
            expandedKeys={treeStates.tree1.expandedKeys}
            checkedKeys={selections.tree1}
            onExpand={(keys) =>
              setTreeStates((prev) => ({
                ...prev,
                tree1: { ...prev.tree1, expandedKeys: keys },
              }))
            }
            onCheck={(keys) => {
              setSelections((prev) => ({
                ...prev,
                tree1: keys,
              }));
            }}
            titleRender={(node) => {
              const isActive = node.key === treeStates.tree1.activeKey;
              return (
                <span className={isActive ? "active-node" : ""}>
                  {node.title}
                </span>
              );
            }}
            checkable
            selectable={false}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Tree 2",
      children: (
        <div
          ref={treeRefs.tree2}
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, "tree2")}
          style={{ outline: "none" }}
        >
          <Tree
            treeData={treeData2}
            expandedKeys={treeStates.tree2.expandedKeys}
            checkedKeys={selections.tree2}
            onExpand={(keys) =>
              setTreeStates((prev) => ({
                ...prev,
                tree2: { ...prev.tree2, expandedKeys: keys },
              }))
            }
            onCheck={(keys) => {
              setSelections((prev) => ({
                ...prev,
                tree2: keys,
              }));
            }}
            titleRender={(node) => {
              const isActive = node.key === treeStates.tree2.activeKey;
              return (
                <span className={isActive ? "active-node" : ""}>
                  {node.title}
                </span>
              );
            }}
            checkable
            selectable={false}
          />
        </div>
      ),
    },
    {
      key: "3",
      label: "Selections",
      children: (
        <div style={{ padding: "16px" }}>
          <h4>Tree 1 Selections:</h4>
          <TreeSelect
            treeData={selectedKeysToTreeData(selections.tree1, treeData1)}
            value={selections.tree1}
            style={{ width: "100%", marginBottom: 24 }}
            multiple
          />

          <h4>Tree 2 Selections:</h4>
          <TreeSelect
            treeData={selectedKeysToTreeData(selections.tree2, treeData2)}
            value={selections.tree2}
            style={{ width: "100%" }}
            multiple
          />
        </div>
      ),
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
      tabPosition="top"
      style={{ padding: "0 16px" }}
    />
  );
};

// Css styles
const styles = `
  .active-node {
    background-color: #e6f7ff;
    border-radius: 4px;
    padding: 0 4px;
    font-weight: 500;
  }
`;

// Add styles to head
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default TreeTabsWithContext;
