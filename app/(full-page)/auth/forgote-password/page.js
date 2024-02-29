/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from 'primereact/button';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { Message } from 'primereact/message';
import { ForgotePassword } from '../../../api/service/auth/route';

const Page = (props) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const [loading, setLoading] = useState(false);

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const sendEmail = async (e) => {
        e.preventDefault();
        if (username) {
            try {
                setLoading(true);
                let res = ForgotePassword(`/api/v1/Password/ForgotPassword?userName=${username}`, 'Password-ForgotPassword');
                if (res) {
                    setIsSuccess(true);
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
            sendEmail(event);
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
                        {isSuccess ? (
                            <Message severity="success" text="We have sent an email containing reset password link." />
                        ) : (
                            <>
                                <div className="text-center mb-5">
                                    <div className="text-900 text-3xl font-medium mb-3">{layoutConfig.appName}</div>
                                    {error ? <Message severity="error" text={error} /> : <p className="text-600 font-medium mb-2"> Enter user id to continue</p>}
                                </div>

                                <div>
                                    <label htmlFor="email1" className="block text-900 text-lg font-medium mb-2">
                                        Username
                                    </label>
                                    <InputText type="text" value={username} placeholder="Username" className="w-full mb-5" onChange={(e) => setUsername(e.target.value)} style={{ padding: '1rem' }} onKeyDown={handleKeyDown} />

                                    <Button label={loading ? 'Please Wait' : 'Send'} disabled={loading} className="w-full p-3 text-xl" onClick={sendEmail}></Button>
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
