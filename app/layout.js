'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import AuthProvider from './providers/AuthProvider';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { Toaster } from 'react-hot-toast';



export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
            </head>
            <body>
                <Toaster
                    toastOptions={{
                        className: '',
                        style: {
                            border: '1px solid #713200',
                            padding: '16px',
                            width: '400px'
                        }
                    }}
                />

                <PrimeReactProvider>
                    <LayoutProvider>
                        <AuthProvider>{children}</AuthProvider>
                    </LayoutProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
