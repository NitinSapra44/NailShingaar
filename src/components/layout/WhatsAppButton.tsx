const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.28-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.93.96-3.49-.23-.36a9.44 9.44 0 0 1-1.45-5.03c0-5.22 4.25-9.47 9.48-9.47a9.4 9.4 0 0 1 6.7 2.78 9.4 9.4 0 0 1 2.77 6.7c0 5.22-4.25 9.46-9.47 9.46zm8.06-17.53A11.33 11.33 0 0 0 12.04.63C5.76.63.65 5.74.65 12.02c0 2 .52 3.96 1.52 5.69L.55 23.63l6.04-1.58a11.35 11.35 0 0 0 5.44 1.39h.01c6.28 0 11.39-5.11 11.39-11.39 0-3.04-1.19-5.9-3.33-8.05z" />
  </svg>
);

/**
 * Floating WhatsApp link. Sits above the product page's mobile sticky bar via
 * --bottom-bar-offset (set by that page while its bar is visible).
 */
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919569570825"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Nail Shingaar on WhatsApp"
      className="fixed right-4 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full text-white shadow-hover transition-[bottom,transform] duration-300 ease-out hover:scale-105 md:right-6"
      style={{
        bottom: 'calc(1rem + env(safe-area-inset-bottom) + var(--bottom-bar-offset, 0px))',
        // WhatsApp's brand green, darkened slightly so the white icon clears 3:1 contrast.
        backgroundColor: '#169D4A',
      }}
    >
      <WhatsAppIcon />
    </a>
  );
}
