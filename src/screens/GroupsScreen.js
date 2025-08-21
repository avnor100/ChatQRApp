// src/screens/GroupsScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Button, TextInput, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { listGroups, createGroup } from '../api';

export default function GroupsScreen({ navigation }) {
  const [token, setToken] = useState(null);
  const [groups, setGroups] = useState([]);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setBusy(true);
      const t = await AsyncStorage.getItem('token');
      if (!t) {
        navigation.replace('Connect');
        return;
      }
      setToken(t);
      const res = await listGroups(t);
      setGroups(res.items || []);
    } catch (e) {
      Alert.alert('Load groups failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [navigation]);

  useEffect(() => { load(); }, [load]);

  const onCreate = async () => {
    if (!newName.trim()) return;
    try {
      setBusy(true);
      await createGroup(token, newName.trim());
      setNewName('');
      await load();
    } catch (e) {
      Alert.alert('Create group failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:'600', marginBottom:12 }}>Groups</Text>

      <View style={{ flexDirection:'row', gap:8, marginBottom:12 }}>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="New group name"
          style={{ flex:1, borderWidth:1, borderColor:'#ccc', padding:10, borderRadius:6 }}
        />
        <Button title="Create" onPress={onCreate} disabled={busy} />
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        refreshing={busy}
        onRefresh={load}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('Chat', { groupId: item.id, groupName: item.name })}
            style={{ padding:12, borderBottomWidth:1, borderBottomColor:'#eee' }}
          >
            <Text style={{ fontSize:16 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ color:'#666' }}>{busy ? 'Loading...' : 'No groups yet.'}</Text>}
      />
    </View>
  );
}
