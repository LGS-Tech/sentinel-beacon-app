import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

const MAP_W = 1525;
const MAP_H = 959;

type Coords = {
  x: number;
  y: number;
};

type Props = {
  floorPlan: any;
  updateMode: boolean;
  showMarker: boolean;
  selectedCoords: Coords;
  onMapPress: (coords: Coords) => void;
};

// Web-only: zoom to cursor + drag pan + click-to-place when updateMode
function WebMapContainer({
  updateMode,
  onMapPress,
  children,
}: {
  updateMode: boolean;
  onMapPress: (c: Coords) => void;
  children: React.ReactNode;
}) {
  const elRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const tRef = useRef({ x: 0, y: 0, scale: 0.5 });
  const [t, setT] = useState({ x: 0, y: 0, scale: 0.5 });
  const drag = useRef<{ mx: number; my: number; moved: boolean } | null>(null);
  const ready = useRef(false);
  const updateModeRef = useRef(updateMode);
  const onMapPressRef = useRef(onMapPress);

  useEffect(() => {
    updateModeRef.current = updateMode;
  }, [updateMode]);
  useEffect(() => {
    onMapPressRef.current = onMapPress;
  }, [onMapPress]);

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

    const cursor = () => (updateModeRef.current ? 'crosshair' : 'grab');

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
      drag.current = { mx: e.clientX, my: e.clientY, moved: false };
      el.style.cursor = updateModeRef.current ? 'crosshair' : 'grabbing';
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!drag.current) return;
      const dx = e.clientX - drag.current.mx;
      const dy = e.clientY - drag.current.my;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
      drag.current.mx = e.clientX;
      drag.current.my = e.clientY;
      const p = tRef.current;
      const next = { ...p, x: p.x + dx, y: p.y + dy };
      tRef.current = next;
      setT({ ...next });
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!drag.current) return;
      const wasDrag = drag.current.moved;
      drag.current = null;
      el.style.cursor = cursor();
      if (!wasDrag && updateModeRef.current) {
        const rect = el.getBoundingClientRect();
        const p = tRef.current;
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const mx = (cx - p.x) / p.scale / MAP_W;
        const my = (cy - p.y) / p.scale / MAP_H;
        if (mx >= 0 && mx <= 1 && my >= 0 && my <= 1)
          onMapPressRef.current({ x: mx, y: my });
      }
    };

    el.style.cursor = cursor();
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

  // sync cursor when updateMode toggles
  useEffect(() => {
    const el = elRef.current;
    if (el?.style) el.style.cursor = updateMode ? 'crosshair' : 'grab';
  }, [updateMode]);

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
          pointerEvents="none"
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

export default function IntruderMap({
  floorPlan,
  updateMode,
  showMarker,
  selectedCoords,
  onMapPress,
}: Props) {
  const [layout, setLayout] = useState({ width: 1, height: 1 });

  const startTouch = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    startTouch.current = {
      x: e.nativeEvent.pageX,
      y: e.nativeEvent.pageY,
    };
  };

  const onTouchEnd = (e: NativeSyntheticEvent<NativeTouchEvent>) => {
    if (!startTouch.current || !updateMode) return;

    const dx = Math.abs(e.nativeEvent.pageX - startTouch.current.x);
    const dy = Math.abs(e.nativeEvent.pageY - startTouch.current.y);

    // treat as tap only if finger barely moved
    if (dx > 10 || dy > 10) return;

    const { locationX, locationY } = e.nativeEvent;

    const x = locationX / layout.width;
    const y = locationY / layout.height;

    onMapPress({ x, y });
  };

  const handleWebPress = (e: any) => {
    if (!updateMode) return;
    const { locationX, locationY } = e.nativeEvent;
    onMapPress({
      x: locationX / layout.width,
      y: locationY / layout.height,
    });
  };

  const layoutHandler = (e: any) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  };

  const marker = showMarker ? (
    <View
      pointerEvents="none"
      style={[
        styles.marker,
        {
          left: `${selectedCoords.x * 100}%` as any,
          top: `${selectedCoords.y * 100}%` as any,
        },
      ]}
    />
  ) : null;

  const mapContent = (
    <>
      <Image source={floorPlan} style={styles.image} resizeMode="contain" />
      {marker}
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <WebMapContainer updateMode={updateMode} onMapPress={onMapPress}>
        {mapContent}
      </WebMapContainer>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      maximumZoomScale={3}
      minimumZoomScale={0.4}
      contentContainerStyle={styles.content}
    >
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        maximumZoomScale={3}
        minimumZoomScale={0.4}
        contentContainerStyle={styles.content}
      >
        <View
          onLayout={layoutHandler}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {mapContent}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: MAP_W, height: MAP_H },
  image: { width: MAP_W, height: MAP_H },

  marker: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: 'red',
    borderWidth: 3,
    borderColor: '#faa4a4', // bit of outlining to increase visibility
    transform: [{ translateX: -8 }, { translateY: -8 }],
  },
});
