import { getServerSession } from 'next-auth';
import Layout from '../../layout/layout';
import authOptions from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
export const metadata = {
    title: 'Node Consult',
    robots: { index: false, follow: false },
    viewport: { initialScale: 1, width: 'device-width' },
    openGraph: {
        type: 'website',
        title: 'Node Consult',
        url: 'https://sakai.primereact.org/',
        ttl: 604800
    },
    icons: {
        icon: '/favicon.ico'
    }
};

export default async function AppLayout({ children }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/auth/login');
    }
    return (
        <Layout>
            <ToastContainer />
            {children}
        </Layout>
    );
}
