import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'server_url';

export async function getServerUrl() {
  const url = await AsyncStorage.getItem(KEY);
  return url || ""; // fallback empty if none set
}

export async function setServerUrl(url) {
  await AsyncStorage.setItem(KEY, url);
}
