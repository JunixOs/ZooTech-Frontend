export function hasExpired(expirationDate: Date | null): boolean {
    if(expirationDate === null) {
        return false;
    }

    return expirationDate.getTime() <= Date.now();
}