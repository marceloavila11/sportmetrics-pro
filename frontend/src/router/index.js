import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import TeamView from "../views/TeamView.vue";
import PredictorView from "../views/PredictorView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/team/:id",
      name: "team-detail",
      component: TeamView,
    },
    {
      path: "/predict",
      name: "predictor",
      component: PredictorView,
    },
  ],
});

export default router;
