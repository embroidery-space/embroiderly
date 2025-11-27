import { createRouter, createWebHashHistory } from "vue-router";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      name: "dashboard",
      path: "/",
      redirect: "/pattern-editor",
    },
    {
      name: "pattern-editor",
      path: "/pattern-editor/:patternId?",
      component: () => import("~/modules/pattern-editor/PatternEditorPage.vue"),
      props: true,
    },
  ],
});
