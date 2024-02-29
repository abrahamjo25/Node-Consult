import { getServerSession } from 'next-auth';
import React from 'react';
import authOptions from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Node Consult',
    description: 'The ultimate collection of design-agnostic, flexible and accessible React UI Components.'
};

export default async function SimpleLayout({ children }) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
        redirect('/');
    }
    return <React.Fragment>{children}</React.Fragment>;
}
