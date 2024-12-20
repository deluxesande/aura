import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen">
            <header className="bg-[#f4f4f4] text-black p-4">
                <nav className="flex justify-between items-center">
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/" className="hover:underline">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link href="/dashboard" className="hover:underline">
                                Dashboard
                            </Link>
                        </li>
                    </ul>

                    <div>
                        <SignedOut>
                            <SignInButton />
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>
                    </div>
                </nav>
            </header>
            <p>Welcome to your new Clerk app.</p>
        </div>
    );
}
