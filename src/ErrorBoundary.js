// src/ErrorBoundary.js
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { error: null, info: null }; }
  componentDidCatch(error, info){ this.setState({ error, info }); }

  render(){
    if (this.state.error){
      return (
        <ScrollView contentContainerStyle={styles.wrap}>
          <Text style={styles.h1}>Something went wrong</Text>
          <Text selectable style={styles.msg}>
            {String(this.state.error?.message || this.state.error)}
          </Text>
          {this.state.info?.componentStack ? (
            <View style={{marginTop:12}}>
              <Text style={styles.h2}>Component stack</Text>
              <Text selectable style={styles.stack}>{this.state.info.componentStack}</Text>
            </View>
          ) : null}
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 16, backgroundColor: '#fff' },
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 8 },
  msg: { fontSize: 14, color: '#333' },
  stack: { fontSize: 12, color: '#666', marginTop: 6 },
});
