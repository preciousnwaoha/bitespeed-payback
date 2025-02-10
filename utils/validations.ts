export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

export const PHONE_NUMBER_REGEX = /^\+?[0-9]{1,15}$/;


// For checking if the email domains match
export const matchingEmailDomain = (emailA: string | null, emailB: string | null) => {
    if (!emailA || !emailB) {
        return false;
    }
    
    const domainA = emailA.split("@")[1];
    const domainB = emailB.split("@")[1];
    
    return domainA === domainB;
}