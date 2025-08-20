/**
 * Guarda las selecciones de items para los niveles.
 */
import { reactive, readonly } from "vue";

const selectionsByLevel = reactive({});

function setSelections(level, spawnName, type, selections) {
  if (!selectionsByLevel[level]) {
    selectionsByLevel[level] = {};
  }
  if (!selectionsByLevel[level][spawnName]) {
    selectionsByLevel[level][spawnName] = { search: {}, distracting: {} };
  }
  selectionsByLevel[level][spawnName][type] = { ...selections };
}

function getSelections(level, spawnName, type) {
  if (!selectionsByLevel[level]) return {};
  if (!selectionsByLevel[level][spawnName]) return {};
  return selectionsByLevel[level][spawnName][type] || {};
}

function getAllSelectionsForLevel(level) {
  return selectionsByLevel[level] || {};
}

function resetAllSelections() {
  Object.keys(selectionsByLevel).forEach((level) => {
    delete selectionsByLevel[level];
  });
}

export function useSelections() {
  return {
    selectionsByLevel: readonly(selectionsByLevel),
    setSelections,
    getSelections,
    getAllSelectionsForLevel,
    resetAllSelections,
  };
}
