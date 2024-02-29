export async function POST() {
    try {
        const res = await fetch(`${authURL}/api/v1/User/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            cache: 'force-cache',
            fetchOptions
        });
        const data = await res.json();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
