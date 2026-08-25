import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const MAP_W = 1525;
const MAP_H = 959;

type CaseMarker = {
  id: number;
  title: string;
  locationX: number;
  locationY: number;
};

type Props = {
  cases: any[];
  selectedCase: any;
  onMarkerPress: (item: any) => void;
  onView: (item: any) => void;
};

// Web-only: mouse-wheel zoom to cursor + drag pan
function WebMapContainer({ children }: { children: React.ReactNode }) {
  const elRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const tRef = useRef({ x: 0, y: 0, scale: 0.5 });
  const [t, setT] = useState({ x: 0, y: 0, scale: 0.5 });
  const drag = useRef<{ mx: number; my: number } | null>(null);
  const ready = useRef(false);

  useEffect(() => {
    if (!size.w || ready.current) return;
    ready.current = true;
    const scale = Math.min(size.w / MAP_W, size.h / MAP_H) * 0.9;
    const init = {
      scale,
      x: (size.w - MAP_W * scale) / 2,
      y: (size.h - MAP_H * scale) / 2,
    };
    tRef.current = init;
    setT(init);
  }, [size]);

  useEffect(() => {
    const el = elRef.current;
    if (!el?.addEventListener) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const p = tRef.current;
      const ns = Math.min(4, Math.max(0.15, p.scale * factor));
      const r = ns / p.scale;
      const next = {
        scale: ns,
        x: cx - (cx - p.x) * r,
        y: cy - (cy - p.y) * r,
      };
      tRef.current = next;
      setT({ ...next });
    };

    const onMouseDown = (e: MouseEvent) => {
      drag.current = { mx: e.clientX, my: e.clientY };
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current) return;
      const p = tRef.current;
      const next = {
        ...p,
        x: p.x + e.clientX - drag.current.mx,
        y: p.y + e.clientY - drag.current.my,
      };
      drag.current = { mx: e.clientX, my: e.clientY };
      tRef.current = next;
      setT({ ...next });
    };
    const onMouseUp = () => {
      drag.current = null;
      el.style.cursor = 'grab';
    };

    el.style.cursor = 'grab';
    el.style.overflow = 'hidden';
    el.style.userSelect = 'none';
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <View
      ref={elRef}
      style={{ flex: 1 } as any}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: width, h: height });
      }}
    >
      {size.w > 0 && (
        <View
          pointerEvents="box-none"
          style={
            {
              position: 'absolute',
              width: MAP_W,
              height: MAP_H,
              left: 0,
              top: 0,
              transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
              transformOrigin: '0 0',
            } as any
          }
        >
          {children}
        </View>
      )}
    </View>
  );
}

export default function DashboardMap({
  cases,
  selectedCase,
  onMarkerPress,
  onView,
}: Props) {
  const floorPlan = require('../assets/images/LGSUniFloorPlan.png');

  // need to have marker be centered on screen when clicked

  function getMarkerColour(title: string) {
    if (title.startsWith('Fire')) return '#DC2626';
    if (title.startsWith('Intruder')) return '#F97316';
    if (title.startsWith('Injury')) return '#16A34A';
    if (title.startsWith('Maintenance')) return '#2563EB';
    return '#6B7280';
  }

  const mapContent = (
    <>
      <Image source={floorPlan} style={styles.image} resizeMode="contain" />
      {cases.map((item) => (
        <View
          key={item.id}
          style={{
            position: 'absolute',
            left: `${item.locationX * 100}%`,
            top: `${item.locationY * 100}%`,
            transform: [{ translateX: -13 }, { translateY: -13 }],
            alignItems: 'center',
          }}
        >
          <Pressable
            onPress={() =>
              onMarkerPress(selectedCase?.id === item.id ? null : item)
            }
            style={[
              styles.marker,
              { backgroundColor: getMarkerColour(item.title) },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
          >
            <View style={styles.markerGlow} />
          </Pressable>
        </View>
      ))}
    </>
  );

  return (
    <View style={styles.screen}>
      {/* Legend */}
      <View style={styles.legend} pointerEvents="none">
        <Text style={styles.legendTitle}>Active Cases</Text>
        {[
          { color: '#2563EB', label: 'Maintenance' },
          { color: '#DC2626', label: 'Fire' },
          { color: '#F97316', label: 'Intruder' },
          { color: '#16A34A', label: 'Injury' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {Platform.OS === 'web' ? (
        <WebMapContainer>{mapContent}</WebMapContainer>
      ) : (
        <ScrollView
          style={styles.container}
          horizontal
          maximumZoomScale={3}
          minimumZoomScale={0.4}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ScrollView
            maximumZoomScale={3}
            minimumZoomScale={0.4}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View>{mapContent}</View>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1 },
  content: { width: MAP_W, height: MAP_H },
  image: { width: MAP_W, height: MAP_H },

  marker: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ translateX: -13 }, { translateY: -13 }],
  },

  markerGlow: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  legend: {
    position: 'absolute',
    top: 16,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.96)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 999,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  legendTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },

  legendLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  // unused but kept for safety
  markerText: {},
  tooltip: {},
  tooltipText: {},
  closeButton: {},
  closeButtonText: {},
});
