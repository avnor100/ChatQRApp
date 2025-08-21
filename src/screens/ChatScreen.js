// src/screens/ChatScreen.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat } from 'react-native-gifted-chat';
import { getMessages, sendMessage } from '../api';

export default function ChatScreen({ route }) {
  const { groupId, groupName } = route.params;
  const [token, setToken] = useState(null);
  const [messages, setMessages] = useState([]);
  const timer = useRef(null);

  const load = useCallback(async () => {
    try {
      const t = token || (await AsyncStorage.getItem('token'));
      if (!t) return;
      const res = await getMessages(t, groupId, 50);
      // Convert backend messages -> GiftedChat format (assuming backend has createdAt, text, userId, id)
      const items = (res.items || []).map(m => ({
        _id: m.id,
        text: m.text,
        createdAt: new Date(m.createdAt),
        user: { _id: m.userId || 'unknown' },
      })).sort((a,b) => b.createdAt - a.createdAt);
      setMessages(items);
    } catch (e) {
      // Avoid noisy alerts while polling
      console.log('load messages error', e?.message || e);
    }
  }, [groupId, token]);

  useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem('token');
      setToken(t);
      await load();
    })();

    timer.current = setInterval(load, 3000);
    return () => clearInterval(timer.current);
  }, [load]);

  const onSend = useCallback(async (newMsgs = []) => {
    try {
      const t = token || (await AsyncStorage.getItem('token'));
      const text = newMsgs[0]?.text?.trim();
      if (!text) return;
      await sendMessage(t, groupId, text);
      await load();
    } catch (e) {
      Alert.alert('Send failed', String(e?.message || e));
    }
  }, [groupId, token, load]);

  return (
    <View style={{ flex:1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 'me' }} // purely UI-side ID for GiftedChat
      />
    </View>
  );
}
