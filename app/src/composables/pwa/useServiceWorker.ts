import { useRegisterSW } from "virtual:pwa-register/vue";
import { ref } from "vue";

let singleton: ReturnType<typeof create> | null = null;
export function useServiceWorker() {
  return (singleton ??= create());
}

function create() {
  const swRegistration = ref<ServiceWorkerRegistration | undefined>();
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_, r) {
      swRegistration.value = r ?? undefined;
    },
  });

  async function check() {
    if (!swRegistration.value) return false;
    await swRegistration.value.update();
    return needRefresh.value;
  }

  async function applyUpdate() {
    await updateServiceWorker(true);
  }

  return { needRefresh, check, applyUpdate };
}
