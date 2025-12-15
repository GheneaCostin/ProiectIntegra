import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function App() {
  const [taken, setTaken] = useState(false);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Aplicație pacient – test simplu</Text>

        <View style={styles.switchRow}>
          <Text style={styles.label}>
            Doză administrată: {taken ? 'Da' : 'Nu '}
          </Text>
          <Switch
              value={taken}
              onValueChange={setTaken}
          />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 22,
    marginBottom: 40,
    fontWeight: 'bold',
    color: '#000000',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginRight: 10,
    color: '#000000',
  },
});