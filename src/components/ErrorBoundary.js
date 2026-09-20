import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <View style={styles.container}>
          <Text style={styles.title}>This section failed to load</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ||
              'Something went wrong while opening this screen. You can retry or go back.'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.xl,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: SPACING.base,
  },
  message: {
    color: COLORS.textMuted,
    fontSize: SIZES.md,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: SIZES.md,
    fontWeight: '800',
  },
});
