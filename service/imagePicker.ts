import * as ImagePicker from "expo-image-picker";

export const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    alert("Permission required to access gallery");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: "images", 
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    base64: true,
  });

  if (!result.canceled) {
    return result.assets[0].base64; 
  }

  return null;
};