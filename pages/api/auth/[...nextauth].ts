import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export default NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Call your backend API to link the user
            const response = await axios.post("/api/linkUser", {
                email: user.email,
                name: user.name,
                image: user.image,
            });

            return response.status === 200;
        },
        async session({ session, token }) {
            // Add custom user details to the session
            if (session.user) {
                (session.user as { id: string }).id = token.id as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
});
