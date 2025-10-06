import { reactive } from "vue";

const selectionsByLevel = reactive({});

export const useSelections = () => {
  const getSelections = (level, zone, type) => {
    return selectionsByLevel[level]?.[zone]?.[type] || {};
  };

  const setSelections = (level, zone, type, obj) => {
    if (!selectionsByLevel[level]) selectionsByLevel[level] = {};
    if (!selectionsByLevel[level][zone]) selectionsByLevel[level][zone] = {};
    selectionsByLevel[level][zone][type] = { ...obj };
  };

  const resetAllSelections = () => {
    Object.keys(selectionsByLevel).forEach((level) => {
      delete selectionsByLevel[level];
    });
  };

  const getSearchObjects = (level) => {
    const hallSearch = selectionsByLevel[level]?.["Hall"]?.search || {};
    return Object.values(hallSearch);
  };

  const getDistractingObjects = (level) => {
    const lvl = selectionsByLevel[level] || {};
    const objs = [];
    Object.entries(lvl).forEach(([zone, types]) => {
      if (zone === "Hall") return;
      if (types.search) objs.push(...Object.values(types.search));
      if (types.distracting) objs.push(...Object.values(types.distracting));
    });
    return [...new Set(objs)];
  };

  return {
    selectionsByLevel,
    getSelections,
    setSelections,
    resetAllSelections,
    getSearchObjects,
    getDistractingObjects,
  };
};
