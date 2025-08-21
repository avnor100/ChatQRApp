// src/screens/ConnectScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { guestSignIn } from '../api';
import { API_BASE } from '../config';

export default function ConnectScreen({ navigation }) {
  const [url, setUrl] = useState(API_BASE);
  const [busy, setBusy] = useState(false);

  const onGuest = async () => {
    try {
      setBusy(true);
      // Optional: if you want runtime URL switching, persist it
      await AsyncStorage.setItem('API_BASE', url);
      const res = await guestSignIn(); // uses API_BASE import; change if you want runtime override
      await AsyncStorage.setItem('token', res.token);
      navigation.replace('Groups');
    } catch (e) {
      Alert.alert('Guest sign-in failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex:1, padding:16, gap:12, justifyContent:'center' }}>
      <Text style={{ fontSize:20, fontWeight:'600' }}>Connect to Backend</Text>
      <Text>Cloudflare URL (must match your running tunnel):</Text>
      <TextInput
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ borderWidth:1, borderColor:'#ccc', padding:10, borderRadius:6 }}
        placeholder="https://your.trycloudflare.com"
      />
      <Button title={busy ? 'Signing in...' : 'Guest Sign-In'} onPress={onGuest} disabled={busy} />
    </View>
  );
}
