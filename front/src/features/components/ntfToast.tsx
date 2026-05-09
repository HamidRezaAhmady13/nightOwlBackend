import toast from "react-hot-toast";
import { BackendNotificationEntity } from "../types/notification.types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function showSimpleToast(
  ntf: BackendNotificationEntity,
  router: AppRouterInstance
) {
  toast(
    (t) => (
      <div
        className="z-[99999999999999999999912222222222222222222222] block"
        onClick={() => {
          toast.dismiss(t.id);
          router.push("/notifications");
        }}
      >
        <strong>New {ntf.type}</strong>
        <div className="text-sm">You have new notification(s)</div>
      </div>
    ),
    { duration: 6000 }
  );
}
