import { reactive } from "vue";

type AlertType = "alert" | "confirm";

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  resolve: ((value: boolean) => void) | null;

  openAlert(message: string, title?: string): void;
  openConfirm(message: string, title?: string): Promise<boolean>;
  ok(): void;
  cancel(): void;
}

export const alertStore: AlertState = reactive<AlertState>({
  visible: false,
  title: "",
  message: "",
  type: "alert",
  resolve: null,

  openAlert(message: string, title = "알림") {
    alertStore.visible = true;
    alertStore.title = title;
    alertStore.message = message;
    alertStore.type = "alert";
    alertStore.resolve = null;
  },

  openConfirm(message: string, title = "확인"): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      alertStore.visible = true;
      alertStore.title = title;
      alertStore.message = message;
      alertStore.type = "confirm";
      alertStore.resolve = resolve;
    });
  },

  ok() {
    if (alertStore.type === "confirm" && alertStore.resolve) {
      alertStore.resolve(true);
    }
    alertStore.visible = false;
    alertStore.resolve = null;
  },

  cancel() {
    if (alertStore.type === "confirm" && alertStore.resolve) {
      alertStore.resolve(false);
    }
    alertStore.visible = false;
    alertStore.resolve = null;
  },
});
