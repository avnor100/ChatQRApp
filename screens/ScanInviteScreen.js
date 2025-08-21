import React,{useEffect,useState} from 'react'; import { View,Text,Button,Alert } from 'react-native'; import { CameraView, useCameraPermissions } from 'expo-camera'; import { useAuth } from '../App'; import { acceptInvite } from '../src/api';
export default function ScanInviteScreen({navigation}){ const [permission,requestPermission]=useCameraPermissions(); const [scanned,setScanned]=useState(false); const { token }=useAuth();
useEffect(()=>{ (async()=>{ if(!permission?.granted) await requestPermission(); })(); },[permission]);
if(!permission) return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>Checking camera permission…</Text></View>;
if(!permission.granted) return (<View style={{flex:1,alignItems:'center',justifyContent:'center',padding:16}}><Text>Camera permission is required.</Text><Button title='Grant permission' onPress={requestPermission}/></View>);
const onScanned=async ({data})=>{ if(scanned) return; setScanned(True);
  try{ const obj=JSON.parse(data); if(obj.type!=='groupInviteToken') throw new Error('Not a valid invite'); await acceptInvite(token,obj.token); Alert.alert('Joined!','You joined the group.'); navigation.goBack(); }
  catch(e){ Alert.alert('Error',e.message||'Failed to join'); setScanned(false); } };
return (<View style={{flex:1}}><CameraView style={{flex:1}} onBarcodeScanned={onScanned} barcodeScannerSettings={{barcodeTypes:['qr']}}/>{scanned && <Button title='Tap to Scan Again' onPress={()=>setScanned(false)}/>}</View>); }