export function sendGAEvent(action: string, category = "Tour", label?: string) {
  if (window?.gtag && typeof window.gtag === "function") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
}
