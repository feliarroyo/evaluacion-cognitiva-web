import { reactive } from "vue";

export const tempLevels = reactive({
  lowLevel: {
    distractingItems: {},
    searchItems: {},
    timeMem: "0",
    timeSearch: "0",
  },
  highLevel: {
    distractingItems: {},
    searchItems: {},
    timeMem: "0",
    timeSearch: "0",
  },
  initialized: false, // para evitar sobrescribir en el onMounted
});
