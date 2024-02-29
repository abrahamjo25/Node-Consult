import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            type: 'credentials',
            credentials: {},
            async authorize(credentials) {
                const { username, password } = credentials;

                const user = {
                    id: 1,
                    name: username
                };
                if (username === 'admin' && password === 'admin') {
                    return user;
                }

                return null;
            }
        })
    ],
    callbacks: {
        jwt(params) {
            if (params.user?.role) {
                params.token.role = params.user.role;
                params.token.id = params.user.id;
                params.token.data = {
                    data: params.user.data
                };
                params.token.exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
            }
            return params.token;
        },
        session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.data = token.data?.data;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: '/auth/login',
        error: '/auth/error'
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
