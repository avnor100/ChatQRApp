import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { getServerUrl, setServerUrl } from './serverUrl';

export default function SettingsScreen({ navigation }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    (async () => {
      const saved = await getServerUrl();
      if (saved) setUrl(saved);
    })();
  }, []);

  const saveUrl = async () => {
    await setServerUrl(url);
    alert("Server URL saved!");
    navigation.goBack();
  };

  return (
    <View style={{ flex:1, justifyContent:"center", padding:20 }}>
      <Text style={{ fontSize:18, marginBottom:10 }}>Enter Server URL</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="https://your-tunnel.trycloudflare.com"
        style={{ borderWidth:1, padding:10, marginBottom:20 }}
      />
      <Button title="Save" onPress={saveUrl} />
    </View>
  );
}
