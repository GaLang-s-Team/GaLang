import * as SecureStore from 'expo-secure-store';

const saveCredentials = async (key, value) => {
  await SecureStore.setItemAsync(key, value);
};

const getCredentials = async (key) => {
  return await SecureStore.getItemAsync(key);
};

const deleteCredentials = async (key) => {
  await SecureStore.deleteItemAsync(key);
};

export { saveCredentials, getCredentials, deleteCredentials };
