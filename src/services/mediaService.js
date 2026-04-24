import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { v2 as cloudinary } from "cloudinary";

// Configurar Cloudinary (reemplaza con tus credenciales)
cloudinary.config({
    cloud_name: envStr('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME'),
    api_key: envStr('EXPO_PUBLIC_CLOUDINARY_API_KEY'),
    api_secret: envStr('EXPO_PUBLIC_CLOUDINARY_API_SECRET'),
});

/**
 * Servicio para manejar multimedia: imágenes y audio.
 */

/**
 * Sube una imagen a Cloudinary y retorna la URL.
 * @param {string} uri - URI de la imagen.
 * @returns {Promise<string>} URL de la imagen subida.
 */
export const uploadImage = async (uri) => {
    try {
        // Convertir la imagen a base64
        const response = await fetch(uri);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
        });

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(base64, {
        folder: "sonschat/images",
        public_id: `image_${Date.now()}`,
        });

        return result.secure_url;
    } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        throw error;
    }
};

/**
 * Selecciona una imagen desde la galería o cámara.
 * @returns {Promise<string|null>} URI de la imagen seleccionada o null si cancelado.
 */
export const pickImage = async () => {
    const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
        alert("Se necesita permiso para acceder a la galería.");
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
    });

    if (!result.canceled) {
        return result.assets[0].uri;
    }
    return null;
};

/**
 * Graba audio y retorna la URI del archivo grabado.
 * @returns {Promise<string|null>} URI del audio grabado o null si error.
 */
export const recordAudio = async () => {
    const permissionResult = await Audio.requestPermissionsAsync();
    if (permissionResult.granted === false) {
        alert("Se necesita permiso para grabar audio.");
        return null;
    }

    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
    });

    const recording = new Audio.Recording();
    try {
        await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
        );
        await recording.startAsync();
        // Simular grabación por 5 segundos para demo
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        return uri;
    } catch (error) {
        console.error("Error recording audio:", error);
        return null;
    }
};

/**
 * Sube un archivo de audio a Cloudinary y retorna la URL.
 * @param {string} uri - URI del audio.
 * @returns {Promise<string>} URL del audio subido.
 */
export const uploadAudio = async (uri) => {
    try {
        // Convertir el audio a base64
        const response = await fetch(uri);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
        });

        // Subir a Cloudinary
        const result = await cloudinary.uploader.upload(base64, {
        folder: "sonschat/audio",
        public_id: `audio_${Date.now()}`,
        resource_type: "video", // Cloudinary trata audio como video
        });

        return result.secure_url;
    } catch (error) {
        console.error("Error uploading audio to Cloudinary:", error);
        throw error;
    }
};

/**
 * Reproduce un audio desde una URL.
 * @param {string} url - URL del audio.
 * @returns {Promise<void>}
 */
export const playAudio = async (url) => {
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    await sound.playAsync();
};
