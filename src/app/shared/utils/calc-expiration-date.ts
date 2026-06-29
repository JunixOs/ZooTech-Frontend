function calculateExpirationDate(lifetime: string): Date | null {
    if (lifetime === "PERMANENT") {
        return null;
    }

    const [horas, minutos, segundos] = lifetime
        .split(":")
        .map(Number);

    const expiresAt = new Date();

    expiresAt.setHours(expiresAt.getHours() + horas);
    expiresAt.setMinutes(expiresAt.getMinutes() + minutos);
    expiresAt.setSeconds(expiresAt.getSeconds() + segundos);

    return expiresAt;
}