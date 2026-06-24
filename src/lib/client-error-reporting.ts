type ClientErrorCapture = {
  captureException?: (error: unknown, context?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    __syndicateEvents?: ClientErrorCapture;
  }
}

export function reportClientError(error: unknown, context?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  window.__syndicateEvents?.captureException?.(error, context);

  if (import.meta.env.DEV) {
    window.dispatchEvent(
      new CustomEvent("syndicate:client-error", {
        detail: { error, context },
      }),
    );
  }
}
