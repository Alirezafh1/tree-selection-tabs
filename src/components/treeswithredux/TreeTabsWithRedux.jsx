import React, { useState, useRef, useEffect } from "react";
import { Tabs, Tree, TreeSelect } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  updateTree1State,
  updateTree2State,
} from "../../redux/slice/treeSlice";

const TreeTabComponent = () => {
  const treeData1 = [
    // Data for Tree 1
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

  // Dispatch Redux actions
  const dispatch = useDispatch();
  // Access tree states from store
  const { tree1, tree2 } = useSelector((state) => state.trees);
  // Current selected tab
  const [activeTab, setActiveTab] = useState("1");

  //Object of Refs
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

  // Find tree node
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

  // Get all child keys
  const getAllChildKeys = (node) => {
    let keys = [];
    if (node.children) {
      node.children.forEach((child) => {
        keys.push(child.key);
        keys = [...keys, ...getAllChildKeys(child)];
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

  // Parent-child check handler
  const handleCheck = (key, checkedKeys, treeData) => {
    const newChecked = new Set(checkedKeys);

    const node = findNodeByKey(treeData, key);
    const addChildren = (node) => {
      if (node.children) {
        for (const child of node.children) {
          newChecked.add(child.key);
          addChildren(child);
        }
      }
    };

    const removeChildren = (node) => {
      if (node.children) {
        for (const child of node.children) {
          newChecked.delete(child.key);
          removeChildren(child);
        }
      }
    };

    const updateParents = (key) => {
      const parents = getAllParentKeys(treeData, key).reverse();
      for (const parentKey of parents) {
        const parentNode = findNodeByKey(treeData, parentKey);
        const allChildren = parentNode.children?.map((c) => c.key) || [];
        const allSelected = allChildren.every((childKey) =>
          newChecked.has(childKey)
        );
        if (allSelected) {
          newChecked.add(parentKey);
        } else {
          newChecked.delete(parentKey);
        }
      }
    };

    if (newChecked.has(key)) {
      //  Deselect
      newChecked.delete(key);
      removeChildren(node);
      updateParents(key);
    } else {
      // Select
      newChecked.add(key);
      addChildren(node);
      updateParents(key);
    }

    return Array.from(newChecked);
  };

  // Handle tree keyboard navigation
  const handleKeyDown = (e, treeState, updateAction, treeData) => {
    const { expandedKeys, checkedKeys, activeKey } = treeState;
    const flatNodes = flattenTree(treeData, expandedKeys);
    const activeIndex = flatNodes.findIndex((node) => node.key === activeKey);

    switch (e.key) {
      case "ArrowDown":
        const currentNode = findNodeByKey(treeData, activeKey);

        if (currentNode?.children && !expandedKeys.includes(activeKey)) {
          // Expand node first if it's not already expanded
          dispatch(
            updateAction({
              expandedKeys: [...expandedKeys, activeKey],
              activeKey: currentNode.children[0].key, // optional
            })
          );
        } else if (activeIndex < flatNodes.length - 1) {
          // Move to next visible node
          dispatch(
            updateAction({
              activeKey: flatNodes[activeIndex + 1].key,
            })
          );
        }
        break;

      case "ArrowUp":
        if (activeIndex > 0) {
          dispatch(updateAction({ activeKey: flatNodes[activeIndex - 1].key }));
        }
        break;

      case "ArrowRight":
        if (activeKey) {
          const node = findNodeByKey(treeData, activeKey);
          if (node.children && !expandedKeys.includes(activeKey)) {
            dispatch(
              updateAction({
                expandedKeys: [...expandedKeys, activeKey],
              })
            );
          }
        }
        break;

      case "ArrowLeft":
        if (activeKey && expandedKeys.includes(activeKey)) {
          dispatch(
            updateAction({
              expandedKeys: expandedKeys.filter((key) => key !== activeKey),
            })
          );
        }
        break;

      case " ":
        e.preventDefault();
        if (activeKey) {
          const newCheckedKeys = handleCheck(activeKey, checkedKeys, treeData);
          dispatch(
            updateAction({
              checkedKeys: newCheckedKeys,
              activeKey: activeKey,
            })
          );
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
      label: "Tab 1",
      children: (
        <div
          ref={treeRefs.tree1}
          tabIndex={0}
          onKeyDown={(e) =>
            handleKeyDown(e, tree1, updateTree1State, treeData1)
          }
          style={{ outline: "none" }}
        >
          <Tree
            treeData={treeData1}
            expandedKeys={tree1.expandedKeys}
            selectedKeys={[tree1.activeKey]}
            checkedKeys={tree1.checkedKeys}
            onExpand={(keys) =>
              dispatch(updateTree1State({ expandedKeys: keys }))
            }
            onCheck={(keys, { node }) => {
              dispatch(
                updateTree1State({
                  checkedKeys: keys,
                  activeKey: node.key,
                })
              );
            }}
            titleRender={(node) => {
              const isActive = node.key === tree1.activeKey;
              let className = "";
              if (isActive) className += "active-node";

              return <span className={className}>{node.title}</span>;
            }}
            checkable
            selectable={false}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Tab 2",
      children: (
        <div
          ref={treeRefs.tree2}
          tabIndex={0}
          onKeyDown={(e) =>
            handleKeyDown(e, tree2, updateTree2State, treeData2)
          }
          style={{ outline: "none" }}
        >
          <Tree
            treeData={treeData2}
            expandedKeys={tree2.expandedKeys}
            selectedKeys={[tree2.activeKey]}
            checkedKeys={tree2.checkedKeys}
            onExpand={(keys) =>
              dispatch(updateTree2State({ expandedKeys: keys }))
            }
            onCheck={(keys, { node }) => {
              dispatch(
                updateTree2State({
                  checkedKeys: keys,
                  activeKey: node.key,
                })
              );
            }}
            titleRender={(node) => {
              const isActive = node.key === tree2.activeKey;
              let className = "";
              if (isActive) className += "active-node";

              return <span className={className}>{node.title}</span>;
            }}
            checkable
            selectable={false}
          />
        </div>
      ),
    },
    {
      key: "3",
      label: "Tab 3",
      children: (
        <div style={{ padding: "16px" }}>
          <TreeSelect
            treeData={selectedKeysToTreeData(tree1.checkedKeys, treeData1)}
            value={tree1.checkedKeys}
            style={{ width: "100%", marginBottom: 24 }}
            multiple
            treeDefaultExpandAll
          />

          <TreeSelect
            treeData={selectedKeysToTreeData(tree2.checkedKeys, treeData2)}
            value={tree2.checkedKeys}
            style={{ width: "100%" }}
            multiple
            treeDefaultExpandAll
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

export default TreeTabComponent;
