import { SignUp } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { useEffect } from "react";

export default async function SignUpPage() {
    const user = await currentUser();

    // useEffect(() => {
    //     if (user) {
    //         const createCustomer = async () => {
    //             const response = await fetch("/api/customers", {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify({
    //                     clerkUserId: user.id,
    //                     name: `${user.firstName} ${user.lastName}`,
    //                     email: user.emailAddresses[0]?.emailAddress,
    //                 }),
    //             });

    //             if (!response.ok) {
    //                 console.error("Failed to create customer");
    //             }
    //         };

    //         createCustomer();
    //     }
    // }, [user]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <SignUp />
        </div>
    );
}
