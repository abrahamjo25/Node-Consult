import { getServerSession } from 'next-auth';
import React from 'react';
import authOptions from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Node Consult',
    description:
        'Node Survey Solutions is a survey company based in Addis Ababa, Ethiopia, that provides data collection services to academic researchers, non-profits, and private sector institutions. We aim to deliver quality data to our clients by providing support from the initiation of research design to data collection..'
};

export default async function SimpleLayout({ children }) {
    const session = await getServerSession(authOptions);
    if (session?.user) {
        redirect('/');
    }
    return <React.Fragment>{children}</React.Fragment>;
}
