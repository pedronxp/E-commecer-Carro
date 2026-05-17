"use client";

import { useEffect, type ReactNode } from "react";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import type { CommercialEventType, SellLeadChannelType } from "@/lib/schemas";

type EventPayload = {
  type: CommercialEventType;
  channel?: SellLeadChannelType;
  sourcePath: string;
  ctaLabel?: string;
  vehicleSlug?: string;
  vehicleTitle?: string;
  carId?: string;
  leadId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export function CommercialViewTracker({ event }: { event: EventPayload }) {
  useEffect(() => {
    recordCommercialEvent(event);
  }, [event]);

  return null;
}

export function WhatsAppTrackedLink({
  message,
  event,
  className,
  children,
}: {
  message: string;
  event: EventPayload;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={buildWhatsappUrl(message)}
      target="_blank"
      rel="noreferrer"
      onClick={() => recordCommercialEvent(event)}
      className={className}
    >
      {children}
    </a>
  );
}

export function recordCommercialEvent(event: EventPayload) {
  const payload = JSON.stringify(event);

  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon("/api/commercial-events", blob);
    return;
  }

  fetch("/api/commercial-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Tracking must never block the customer journey.
  });
}
