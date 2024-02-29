/* eslint-disable @next/next/no-img-element */
'use client';
import React, { useContext, useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Message } from 'primereact/message';
import { useRouter } from 'next/router';
import { ResetPassword } from '../../../api/service/auth/route';

const Page = (props) => {
    const [username, setUsername] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccessful, setIsSuccessful] = useState(true);
    const { layoutConfig } = useContext(LayoutContext);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { activation_token } = router.query;
    useEffect(() => {
        setToken(activation_token);
    }, []);
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const resetPassword = async (e) => {
        e.preventDefault();
        if (username || password) {
            let credential = {
                username: username,
                token: token,
                password: password
            };
            try {
                setLoading(true);
                let res = ResetPassword(credential, `/api/v1/Password/ForgotPassword`, 'Password-ForgotPassword');
                if (res) {
                    setIsSuccessful(true);
                } else {
                    setError(data.errors[0]);
                }
            } catch (error) {
                setError('Network error. please try again ');
            } finally {
                setLoading(false);
            }
        }
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            // 👇️
            resetPassword(event);
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
                        {isSuccessful ? (
                            <>
                                <Message severity="success" text="Password changed successfully." className="mb-3" />
                                <br />
                                <p>
                                    <a href="/auth/login">Login</a>
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="text-center mb-5">
                                    <div className="text-900 text-3xl font-medium mb-3">{layoutConfig.appName}</div>
                                    {error ? <Message severity="error" text={error} /> : <p className="text-600 font-medium mb-2"> Create new password</p>}
                                    {confirmPassword && password !== confirmPassword && <span className="text-red-600 text-center">password not match</span>}
                                </div>

                                <div>
                                    <label htmlFor="email1" className="block text-900 text-lg font-medium mb-2">
                                        Username
                                    </label>
                                    <InputText type="text" value={username} placeholder="Enter user id" className="w-full mb-5" onChange={(e) => setUsername(e.target.value)} style={{ padding: '1rem' }} onKeyDown={handleKeyDown} />

                                    <label htmlFor="password1" className="block text-900 font-medium text-lg mb-2">
                                        New Password
                                    </label>
                                    <InputText type="password" value={password} placeholder="Create new password" className="w-full mb-5" onChange={(e) => setPassword(e.target.value)} style={{ padding: '1rem' }} onKeyDown={handleKeyDown} />
                                    <label htmlFor="password1" className="block text-900 font-medium text-lg mb-2">
                                        Confirm Password
                                    </label>
                                    <InputText
                                        type="password"
                                        value={confirmPassword}
                                        placeholder="Confirm password"
                                        className="w-full mb-5"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{ padding: '1rem' }}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <Button label={loading ? 'Please Wait' : 'Save'} disabled={loading || password !== confirmPassword} className="w-full p-3 text-xl" onClick={resetPassword}></Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Page;
