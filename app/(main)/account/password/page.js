'use client';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import { classNames } from 'primereact/utils';
import { Divider } from 'primereact/divider';
import { ChangePassword } from '../../../api/service/auth/route';

const Page = () => {
    let emptyResult = {
        oldPassword: null,
        newPassword: null
    };
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [loginInput, setLoginInput] = useState(emptyResult);
    const [confirmPassword, setConfirmPassword] = useState(null);

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _result = { ...loginInput };
        _result[`${name}`] = val;
        setLoginInput(_result);
    };
    const onPasswordConfirm = (e) => {
        const val = (e.target && e.target.value) || '';
        setConfirmPassword(val);
    };
    const changePassword = (e) => {
        setSubmitted(true);
        e.preventDefault();
        if (loginInput.newPassword !== confirmPassword) {
            setError('Password not match!');
        } else if (loginInput.oldPassword && loginInput.newPassword) {
            setSaving(true);
            let res = ChangePassword(loginInput, `/api/v1/Password/ChangePassword`, 'Password-ChangePassword');
            if (res) {
                setError('');
            }
            setSaving(false);
        }
    };
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            changePassword(event);
        }
    };
    const passwordHeader = <div className="font-bold mb-3">Pick a password</div>;
    const footer = (
        <>
            <Divider />
            <p className="mt-2">Suggestions</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>At least one lowercase</li>
                <li>At least one uppercase</li>
                <li>At least one numeric</li>
                <li>Minimum 8 characters</li>
            </ul>
        </>
    );
    return (
        <div className="formgrid grid card">
            <div className="field col-3 py-8">
                <h5>Update user password</h5>
                <p className="mt-2">Suggestions</p>
                <ul className="pl-2 ml-2 mt-0 line-height-3">
                    <li>At least one lowercase</li>
                    <li>At least one uppercase</li>
                    <li>At least one numeric</li>
                    <li>Minimum 8 characters</li>
                </ul>
            </div>
            <div className="field col-6">
                <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                    <span className="text-red-600">{error}</span>
                    <div className="card p-fluid mt-2">
                        <label htmlFor="old-password" className="text-500">
                            Enter Old Password *
                        </label>
                        <br />
                        <div className="field">
                            <InputText
                                id="old-password"
                                type="password"
                                placeholder=" Old Password"
                                value={loginInput.oldPassword}
                                onChange={(e) => onInputChange(e, 'oldPassword')}
                                onKeyDown={handleKeyDown}
                                required
                                autoFocus
                                className={classNames({ 'p-invalid': submitted && !loginInput.oldPassword })}
                            />
                        </div>
                        <label htmlFor="new-password" className="text-500">
                            Enter New Password *
                        </label>
                        <br />
                        <div className="field">
                            <Password
                                placeholder="New Password"
                                value={loginInput.newPassword}
                                onChange={(e) => onInputChange(e, 'newPassword')}
                                onKeyDown={handleKeyDown}
                                required
                                className={classNames({ 'p-invalid': submitted && !loginInput.newPassword })}
                                header={passwordHeader}
                                footer={footer}
                                autocomplete={loginInput.newPassword}
                            />
                        </div>
                        <label htmlFor="old-password" className="text-500">
                            Confirm Password *
                        </label>
                        <br />
                        <div className="field">
                            <InputText
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => onPasswordConfirm(e)}
                                onKeyDown={handleKeyDown}
                                required
                                className={classNames({ 'p-invalid': submitted && !confirmPassword })}
                                autoComplete={confirmPassword}
                            />
                        </div>
                        {submitted && loginInput.newPassword !== confirmPassword && <span className="text-danger">Password confirmation not match.</span>}
                        <div className="py-5">
                            {saving ? <Button label="Please Wait.." icon="pi pi-spin pi-spinner" className="float-end" text disabled={true} /> : <Button label="Submit" icon="pi pi-arrow-right" className="float-end" text onClick={changePassword} />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;
