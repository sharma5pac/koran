/**
 * Kaaba Coordinates:
 * Latitude: 21.4225
 * Longitude: 39.8262
 */

export const KAABA_LAT = 21.4225;
export const KAABA_LON = 39.8262;

export const calculateQibla = (userLat: number, userLon: number): number => {
    const phi1 = userLat * (Math.PI / 180);
    const phi2 = KAABA_LAT * (Math.PI / 180);
    const deltalambda = (KAABA_LON - userLon) * (Math.PI / 180);

    const y = Math.sin(deltalambda);
    const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltalambda);

    let qibla = Math.atan2(y, x) * (180 / Math.PI);

    // Normalize to 0-360
    return (qibla + 360) % 360;
};
