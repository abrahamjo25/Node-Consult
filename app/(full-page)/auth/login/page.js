/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useEffect, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { GET, POST } from '../../../api/auth/login/route';
import { signIn } from 'next-auth/react';
import { Message } from 'primereact/message';
import { setCookie } from '../../../(main)/helper/storage';

const LoginPage = (props) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const [loading, setLoading] = useState(false);
    // useEffect(() => {
    //     async function tokenGen() {
    //         const res = await GET();
    //         if (!res.ok) {
    //             throw new Error('Unable to get access token!');
    //         }
    //         const data = await res.json();
    //         setCookie('accessToken', data?.data?.accessToken, { expires: 1 });
    //         setCookie('refreshToken', data?.data?.refreshToken, { expires: 1 });
    //     }
    //     tokenGen();
    // }, []);
    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });
    const origin = router.asPath;
    const postLogin = async (e) => {
        e.preventDefault();
        if (username || password) {
            let credential = {
                username: username,
                password: password
            };
            try {
                setLoading(true);
                // const { data, status } = await POST(credential);
                // if (status === 200 && data?.idToken) {
                // setCookie('data', JSON.stringify(data));
                const login = await signIn('credentials', {
                    ...credential,
                    redirect: false,
                    callbackUrl: '/'
                });
                if (!login.error) {
                    router.push('/');
                    router.refresh();
                    setCookie('data', JSON.stringify(data));
                } else {
                    setError('Incorrect credentials');
                }
                // }
                // else {
                //     setError(data.errors[0]);
                // }
            } catch (error) {
                // setError('Network error. please try again ');
            } finally {
                setLoading(false);
            }
        }
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            // 👇️
            postLogin(event);
        }
    };
    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <div
                    style={{
                        width: '110%',
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">{layoutConfig.appName}</div>
                            {error ? <Message severity="error" text={error} /> : <p className="text-600 font-medium mb-2"> Sign in to continue</p>}
                        </div>

                        <div>
                            <label htmlFor="email1" className="block text-900 text-lg font-medium mb-2">
                                Username
                            </label>
                            <InputText type="text" value={username} placeholder="Username" className="w-full mb-5" onChange={(e) => setUsername(e.target.value)} style={{ padding: '1rem' }} onKeyDown={handleKeyDown} />

                            <label htmlFor="password1" className="block text-900 font-medium text-lg mb-2">
                                Password
                            </label>
                            {/* <InputText inputId="password1" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full mb-5" inputClassName="w-full p-3 md:w-30rem"></Password> */}
                            <InputText type="password" value={password} placeholder="Password" className="w-full mb-5" onChange={(e) => setPassword(e.target.value)} style={{ padding: '1rem' }} onKeyDown={handleKeyDown} />

                            <div className="flex align-items-center justify-content-between mb-5 gap-5">
                                <div className="flex align-items-center">
                                    <Checkbox inputId="rememberme1" checked={checked} onChange={(e) => setChecked(e.checked ?? false)} className="mr-2"></Checkbox>
                                    <label htmlFor="rememberme1">Remember me</label>
                                </div>
                                <a className="font-medium no-underline ml-2 text-right cursor-pointer" style={{ color: 'var(--primary-color)' }} href={`/auth/forgote-password?origin=${encodeURIComponent(origin)}`}>
                                    Forgot password?
                                </a>
                            </div>
                            <Button label={loading ? 'Please Wait' : 'Sign In'} disabled={loading} className="w-full p-3 text-xl" onClick={postLogin}></Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default LoginPage;
