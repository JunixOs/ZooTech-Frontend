function calculateExpirationDate(minutes: string): Date | null {
    const expirationMinutes = Number(minutes);

    if(isNaN(expirationMinutes)){
        throw Error("errorInvalidExpirationTokenTime");
    }

    const expiresAt = new Date();

    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return expiresAt;
}