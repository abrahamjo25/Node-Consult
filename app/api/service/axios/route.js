import https from 'https';
import { getCookie } from '../../../(main)/helper/storage';

const baseURL = 'http://svhqdts01:1213';
// const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
const data = getCookie('data');
const parsedData = data ? JSON.parse(data) : null;
const idToken = parsedData?.idToken;

const accessToken = getCookie('accessToken');

const fetchOptions = {
    agent: new https.Agent({
        rejectUnauthorized: false
    })
};

export async function GET(url, claim) {
    try {
        const res = await fetch(`${baseURL + url}`, {
            method: 'GET',
            headers: {
                accessToken: accessToken,
                idToken: idToken,
                clientClaim: claim
            },
            fetchOptions
        });
        if (res.ok) {
            const data = res.json();
            return data;
        }
        return null;
    } catch (error) {
        console.log(error);

        return null;
    }
}
export async function POST(body, url, claim) {
    try {
        const req = await fetch(`${baseURL + url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accessToken: accessToken,
                idToken: idToken,
                clientClaim: claim
            },
            body: JSON.stringify(body),
            cache: 'force-cache',
            fetchOptions
        });
        console.log(req);
        if (req.ok) {
            const data = await req.json();
            return { data };
        }
        return null;
    } catch (error) {
        return { error: 'Internal server error', status: 500 };
    }
}

export async function PUT(body, url, claim) {
    try {
        const req = await fetch(`${baseURL + url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                accessToken: accessToken,
                idToken: idToken,
                clientClaim: claim
            },
            body: JSON.stringify(body),
            fetchOptions
        });
        const data = await req.json();
        return { data };
    } catch (error) {
        return { error: 'Internal server error', status: 500 };
    }
}
export async function DELETE(url, claim) {
    try {
        const req = await fetch(`${baseURL + url}`, {
            method: 'DELETE',
            headers: {
                accessToken: accessToken,
                idToken: idToken,
                clientClaim: claim
            },
            fetchOptions
        });
        const data = await req.json();
        return { data };
    } catch (error) {
        return { error: 'Internal server error', status: 500 };
    }
}
