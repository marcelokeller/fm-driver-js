export function sendGAEvent(action: string, category = "Tour", label?: string) {
  console.log(`event - action: ${action}, event_category: ${category}, event_label: ${label}`);

  if (window?.gtag && typeof window.gtag === "function") {
     

    window.gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }
}
