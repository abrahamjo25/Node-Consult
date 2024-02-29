'use client';
import React from 'react';
import { Button } from 'primereact/button';

export default function Error({ error, reset }) {
    return (
        <div className="align-items-center justify-content-center">
            <div className="w-full py-8 flex flex-column align-items-center" style={{ borderRadius: '53px' }}>
                <div className="flex justify-content-center align-items-center bg-pink-500 border-circle" style={{ height: '3.2rem', width: '3.2rem' }}>
                    <i className="pi pi-fw pi-exclamation-circle text-2xl text-white"></i>
                </div>
                <h1 className="text-900 font-bold text-3xl mb-2">Error Occured</h1>
                <div className="text-red-600 mb-5 text-lg">{error.message}</div>
                <Button label="Retry" className="p-button-rounded p-button-danger" onClick={() => reset()} />
            </div>
        </div>
    );
}
