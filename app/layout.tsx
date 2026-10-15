import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'KUSUDAMA — 祝福する瞬間を贈る',description:'自分では割れない、誰かに贈るためのくす玉。',manifest:'/manifest.webmanifest',referrer:'no-referrer',icons:{icon:'/icon.svg',apple:'/icon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ja"><body>{children}</body></html>}
