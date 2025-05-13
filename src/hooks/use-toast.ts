
import { useToast as useToastInternal, type ToastProps } from "@/components/ui/toast";

export const useToast = useToastInternal;

export function toast(props: ToastProps) {
  const { toast } = useToastInternal();
  toast(props);
}
