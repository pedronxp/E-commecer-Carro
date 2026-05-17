const DEFAULT_WHATSAPP_NUMBER = "5500000000000";

export function getWhatsappNumber(): string {
  return (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, "");
}

export function buildWhatsappUrl(message: string, phone = getWhatsappNumber()): string {
  const cleanPhone = phone.replace(/\D/g, "") || DEFAULT_WHATSAPP_NUMBER;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildVehicleInterestMessage({
  title,
  year,
  price,
  url,
}: {
  title: string;
  year?: number;
  price?: string;
  url?: string;
}): string {
  const parts = [`Tenho interesse no veiculo ${title}`];
  if (year) parts.push(`ano ${year}`);
  if (price) parts.push(`anunciado por ${price}`);
  if (url) parts.push(`Link: ${url}`);
  parts.push("Pode me passar disponibilidade e proximos passos?");
  return parts.join(". ");
}
