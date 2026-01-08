export function haptic(type: "light" | "medium" | "heavy" = "light") {
    if (!("vibrate" in navigator)) return;

    const patterns = {
        light: 10,
        medium: 30,
        heavy: 60,
    };

    navigator.vibrate(patterns[type]);
}