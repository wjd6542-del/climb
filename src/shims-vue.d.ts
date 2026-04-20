import type { ToastInterface } from "vue-toastification";

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $t: (key: string) => string;
    $alert: (message: string, title?: string) => void;
    $confirm: (message: string, title?: string) => Promise<boolean>;
    $toast: ToastInterface;
  }
}

export {};
