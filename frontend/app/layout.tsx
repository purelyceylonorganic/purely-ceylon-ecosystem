import './globals.css'; // 👈 இந்த ஒரு வரிதான் அந்த மேஜிக் ஸ்டைல்களைக் கொண்டுவரும்!

export const metadata = {
  title: 'Purely Ceylon Store',
  description: 'Premium Spices & Organics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}