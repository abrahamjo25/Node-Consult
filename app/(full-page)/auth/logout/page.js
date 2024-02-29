'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Logout = () => {
    const router = useRouter();
    useEffect(() => {
        removeItemFromLocalStorage();
    }, []);
    const removeItemFromLocalStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/auth/login');
        }
    };
};

export default Logout;
