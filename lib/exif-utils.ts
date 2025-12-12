import ExifReader from 'exifreader';

export interface ExifData {
    latitude?: number;
    longitude?: number;
    date?: Date;
}

export async function extractExifData(file: File): Promise<ExifData> {
    try {
        const tags = await ExifReader.load(file);

        let latitude: number | undefined;
        let longitude: number | undefined;
        let date: Date | undefined;

        // Extract GPS
        if (tags['GPSLatitude'] && tags['GPSLongitude']) {
            const latDescription = tags['GPSLatitude'].description;
            const lonDescription = tags['GPSLongitude'].description;

            // Simple parsing, ExifReader usually returns decimal if configured or array
            // We'll assume standard format or use the description which is often decimal-like
            // For robustness, let's look at the raw values if possible, but description is often safest for quick display
            // Actually, ExifReader provides a helper for this usually, but let's try to parse the description
            // or check if there's a better way. 
            // A safer way with ExifReader in browser:

            // NOTE: ExifReader types might be tricky. Let's try a standard extraction.
            // The 'description' field is usually a number for GPS in recent versions.

            latitude = parseFloat(latDescription as string);
            longitude = parseFloat(lonDescription as string);

            if (tags['GPSLatitudeRef'] && Array.isArray(tags['GPSLatitudeRef'].value) && tags['GPSLatitudeRef'].value[0] === 'S') {
                latitude = -latitude;
            }
            if (tags['GPSLongitudeRef'] && Array.isArray(tags['GPSLongitudeRef'].value) && tags['GPSLongitudeRef'].value[0] === 'W') {
                longitude = -longitude;
            }
        }

        // Extract Date
        if (tags['DateTimeOriginal']) {
            const dateStr = tags['DateTimeOriginal'].description;
            // Format: YYYY:MM:DD HH:MM:SS
            if (dateStr) {
                const [datePart, timePart] = dateStr.split(' ');
                const [year, month, day] = datePart.split(':');
                const [hour, minute, second] = timePart.split(':');
                date = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hour),
                    parseInt(minute),
                    parseInt(second)
                );
            }
        }

        return { latitude, longitude, date };
    } catch (error) {
        console.error("Error reading EXIF:", error);
        return {};
    }
}
