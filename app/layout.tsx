import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatIf FC',
  description: 'WhatIf FC – Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',margin:'8px 0 18px'}}>
            <h1>WhatIf FC</h1>
            <span className="small">API: {process.env.NEXT_PUBLIC_API_BASE}</span>
          </header>
          {children}
          <footer className="small" style={{marginTop:16,opacity:.7}}>© WhatIf FC</footer>
        </div>
      </body>
    </html>
  );
}
