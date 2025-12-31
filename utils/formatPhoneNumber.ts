export const formatPhoneNumber = (phoneNumber: string): string | null => {
    // 1. Remove any non-digit characters (this handles the + sign automatically)
    phoneNumber = phoneNumber.replace(/\D/g, "");

    // 2. Define Regex patterns
    const regexLocal = /^0(1|7)\d{8}$/; // Matches 07... or 01...
    const regexIntl = /^254(1|7)\d{8}$/; // Matches 2547... or 2541...

    // 3. Check and Format
    if (regexLocal.test(phoneNumber)) {
        return phoneNumber.replace(/^0/, "254");
    } else if (regexIntl.test(phoneNumber)) {
        return phoneNumber;
    }

    return null;
};
