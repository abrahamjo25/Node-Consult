import { NextResponse } from 'next/server';
import https from 'https';
const fetchOptions = {
    agent: new https.Agent({
        rejectUnauthorized: false
    })
};
const authURL = process.env.NEXT_PUBLIC_AUTH_URL;
const clientCredential = {
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET
};
export async function GET() {
    try {
        const res = await fetch(`${authURL}/api/v1/Client/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clientCredential),
            cache: 'force-cache',
            fetchOptions
        });
        const data = await res.json();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
export async function POST(req) {
    try {
        const accessToken = getCookie('accessToken');
        const res = await fetch(`${authURL}/api/v1/User/Login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accessToken: accessToken,
                clientClaim: 'User-Login'
            },
            body: JSON.stringify(req),
            cache: 'force-cache',
            fetchOptions
        });
        const data = await res.json();
        return { data, status: res.status };
    } catch (error) {
        return { error: 'Internal server error', status: 500 };
    }
}
