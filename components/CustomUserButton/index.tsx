import { UserButton, useUser } from "@clerk/nextjs";

const CustomUserButton = () => {
    const { user } = useUser();

    return (
        <div className="flex items-center space-x-4">
            <UserButton />
            <span>{user?.firstName || user?.username}</span>
        </div>
    );
};

export default CustomUserButton;
