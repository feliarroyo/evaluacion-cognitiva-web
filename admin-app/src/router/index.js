import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Login.vue";
import PatientList from "../views/PatientList.vue";
import NewPatient from "../views/NewPatient.vue";
import LevelSettingsPage from "../views/LevelSettingsPage.vue";
import LevelSelectionPage from "@/views/LevelSelectionPage.vue";
import PatientInfo from "../views/PatientInfo.vue";
import SpawnSettingsView from "@/views/SpawnSettingsView.vue";
import VirtualEnvironment from "@/views/VirtualEnvironment.vue";
import SelectItems from "@/views/SelectItems.vue";
import PatientResultDetails from "@/components/PatientResultDetail.vue";

const router = createRouter({
  routes: [
    { path: "/", name: "Login", component: Login },
    { path: "/patients", name: "PatientList", component: PatientList },
    { path: "/new-patient", name: "NewPatient", component: NewPatient },
    { path: "/info", name: "PatientInfo", component: PatientInfo },
    {
      path: "/level-selection",
      name: "LevelSelectionPage",
      component: LevelSelectionPage,
    },
    {
      path: "/level-settings",
      name: "LevelSettingsPage",
      component: LevelSettingsPage,
    },
    {
      path: "/select-items",
      name: "SpawnSettingsView",
      component: SpawnSettingsView,
    },
    {
      path: "/select-items-new",
      name: "SelectItems",
      component: SelectItems,
    },

    {
      path: "/virtual-environment",
      name: "VirtualEnvironment",
      component: VirtualEnvironment,
    },
    {
      path: "/result-details",
      name: "PatientResultDetails",
      component: PatientResultDetails,
    },
  ],
  history: createWebHistory(import.meta.env.BASE_URL),
});

export default router;
