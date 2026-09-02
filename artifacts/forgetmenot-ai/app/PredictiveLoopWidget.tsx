import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Pressable,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PredictiveLoopWidgetProps {
  signals: any[]; // Accepts live dbSignals array
  onPress: () => void;
}

/**
 * 🌀 CYBERNETIC ANIMATED PREDICTIVE LOOP RADAR
 * Features continuous rotational animations and dynamic orbiting database anomaly node pins.
 */
export default function PredictiveLoopWidget({ signals = [], onPress }: PredictiveLoopWidgetProps) {
  const signalCount = signals.length;

  // 🌟 ANIMATION CONTROLLERS
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1️⃣ Infinite rotation loop animation
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 16000, // Full rotation cycle in 16 seconds
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // 2️⃣ Subtle radar core breathing pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, { toValue: 1.15, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseValue, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  // Interpolate rotation degrees (0deg to 360deg)
    const spinAngle = spinValue.interpolate({
      inputRange: [0, 1], // ✅ Explicitly defined numeric array bounds
      outputRange: ['0deg', '360deg'],
    });

  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pressableArea, pressed && { opacity: 0.9 }]}>

        {/* 🌌 CIRCULAR ORBITAL BACKGROUND CONTAINER */}
        <ImageBackground
          source={require('../assets/images/PredictiveLoopWidgetImage.png')} // Local background asset texture
          style={styles.circularLoopFrame}
          imageStyle={styles.imageCircularMask}
        >
          {/* Deep cyber dark contrast vignette overlay */}
          <View style={styles.radialDarkScrim}>

            {/* ✨ ROTATING OUTER ORBIT RING WITH EMBEDDED NODE PINS */}
            <Animated.View style={[styles.rotatingOrbitLayer, { transform: [{ rotate: spinAngle }] }]}>
              <View style={styles.orbitalRingGlow} />

              {/* 🛰️ DYNAMIC ORBITING DATA NODES (Up to 6 nodes mapped around the perimeter) */}
              {signals.slice(0, 6).map((item, index, arr) => {
                const total = Math.min(arr.length, 6);
                const angle = (index / total) * (2 * Math.PI);
                const radius = 96; // Distance from center anchor
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                // Color coordinate based on category tag
                const nodeColor = item.color || '#00ffcc';

                return (
                  <View
                    key={item.id || index}
                    style={[
                      styles.orbitNodePin,
                      {
                        transform: [{ translateX: x }, { translateY: y }],
                        borderColor: nodeColor,
                        backgroundColor: '#050506',
                      }
                    ]}
                  >
                    <View style={[styles.orbitNodeInnerCore, { backgroundColor: nodeColor }]} />
                  </View>
                );
              })}
            </Animated.View>

            {/* STATIC INNER DASHED GRID ORBIT */}
            <View style={styles.innerDashedOrbit} />

            {/* 🎯 CORE METRICS DATA CLUSTER */}
            <Animated.View style={[styles.coreDataCluster, { transform: [{ scale: pulseValue }] }]}>
              <View style={styles.radarLivePulseDot} />
              <Text style={styles.loopKicker}>PREDICTIVE LOOP</Text>
              <Text style={styles.loopCountValue}>{signalCount < 10 ? `0${signalCount}` : signalCount}</Text>
              <Text style={styles.loopLabelText}>Active Anomalies</Text>

              <View style={styles.inspectButtonPill}>
                <Text style={styles.inspectButtonText}>INSPECT RADAR</Text>
                <Feather name="arrow-up-right" size={11} color="#00ffcc" />
              </View>
            </Animated.View>

          </View>
        </ImageBackground>

      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  pressableArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularLoopFrame: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 255, 204, 0.35)',
    ...Platform.select({
      ios: {
        shadowColor: '#00ffcc',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 18,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 0px 28px rgba(0, 255, 204, 0.28)',
      }
    }),
  },
  imageCircularMask: {
    borderRadius: 110,
  },
  radialDarkScrim: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 110,
    backgroundColor: 'rgba(5, 5, 6, 0.84)', // Cinematic vignette mask
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  rotatingOrbitLayer: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitalRingGlow: {
    position: 'absolute',
    width: 202,
    height: 202,
    borderRadius: 101,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.2)',
  },
  orbitNodePin: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitNodeInnerCore: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  innerDashedOrbit: {
    position: 'absolute',
    width: 174,
    height: 174,
    borderRadius: 87,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
  },
  coreDataCluster: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarLivePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00ffcc',
    marginBottom: 4,
    shadowColor: '#00ffcc',
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  loopKicker: {
    color: '#8a8f98',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 2,
  },
  loopCountValue: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },
  loopLabelText: {
    color: '#00ffcc',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inspectButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.25)',
    gap: 4,
  },
  inspectButtonText: {
    color: '#00ffcc',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
});
