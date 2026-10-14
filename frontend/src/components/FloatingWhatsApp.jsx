import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const whatsappNumber = '917540061497';
  const defaultMessage = encodeURIComponent(
    'Hello Saravanan Builders,\nI would like to enquire about constructing an individual residential house with your team.'
  );

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${defaultMessage}`}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp"
      title="Chat with Saravanan Builders on WhatsApp"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle size={32} />
    </a>
  );
}
