import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';

const getCloudinaryConfig = () => {
    const extra = Constants.expoConfig?.extra ?? {};
    const cloudinary = extra.cloudinary ?? {};
    return {
        cloudName:
        cloudinary.cloudName || process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset:
        cloudinary.uploadPreset || process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    };
};

const getFileType = (uri, defaultType) => {
    const extension = uri.split('.').pop()?.toLowerCase();
    if (!extension) return defaultType;
    if (['jpg', 'jpeg'].includes(extension)) return 'image/jpeg';
    if (extension === 'png') return 'image/png';
    if (extension === 'gif') return 'image/gif';
    if (extension === 'm4a') return 'audio/m4a';
    if (extension === 'mp3') return 'audio/mpeg';
    if (extension === 'wav') return 'audio/wav';
    return defaultType;
};

const uploadToCloudinary = async ({ uri, folder, publicId, resourceType, defaultType }) => {
    const { cloudName, uploadPreset } = getCloudinaryConfig();
    if (!cloudName || !uploadPreset) {
        throw new Error('Missing Cloudinary configuration');
    }

    const fileType = getFileType(uri, defaultType);
    const fileName = publicId || `${resourceType || 'file'}_${Date.now()}`;
    const formData = new FormData();
    formData.append('file', {
        uri,
        name: `${fileName}.${uri.split('.').pop() ?? 'dat'}`,
        type: fileType,
    });
    formData.append('upload_preset', uploadPreset);
    if (folder) formData.append('folder', folder);

    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType ?? 'image'}/upload`;
    const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Cloudinary upload failed');
    }

    return data.secure_url;
};

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
        return await uploadToCloudinary({
        uri,
        folder: 'sonschat/images',
        publicId: `image_${Date.now()}`,
        resourceType: 'image',
        defaultType: 'image/jpeg',
        });
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
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
        return await uploadToCloudinary({
        uri,
        folder: 'sonschat/audio',
        publicId: `audio_${Date.now()}`,
        resourceType: 'video',
        defaultType: 'audio/m4a',
        });
    } catch (error) {
        console.error('Error uploading audio to Cloudinary:', error);
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
