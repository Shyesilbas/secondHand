import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { theme } from '../../common/theme/theme.js';
import Alert from '../../common/components/ui/Alert.jsx';
import Skeleton from '../../common/components/ui/Skeleton.jsx';

/** Radius of the shaded area; the stored point is already 100-300 m away from the neighborhood center. */
const AREA_RADIUS_METERS = 400;

/**
 * Approximate location of a real estate listing: a shaded area around the server-computed point,
 * never a pin on the building. Shown only when the listing has coordinates.
 */
const RealEstateMap = ({ listing }) => {
	const containerRef = useRef(null);
	const [state, setState] = useState('loading');
	const lat = Number(listing?.latitude);
	const lon = Number(listing?.longitude);

	useEffect(() => {
		if (!containerRef.current || !Number.isFinite(lat) || !Number.isFinite(lon)) return undefined;
		let map;
		let cancelled = false;
		import('leaflet')
			.then(({ default: L }) => {
				if (cancelled || !containerRef.current) return;
				map = L.map(containerRef.current, { scrollWheelZoom: false, attributionControl: true }).setView([lat, lon], 15);
				L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 18,
					attribution: '&copy; OpenStreetMap',
				}).addTo(map);
				const color = theme.colors.primary.DEFAULT;
				L.circle([lat, lon], { radius: AREA_RADIUS_METERS, color, weight: 1, fillColor: color, fillOpacity: 0.15 }).addTo(map);
				setState('ready');
			})
			.catch(() => {
				if (!cancelled) setState('error');
			});
		return () => {
			cancelled = true;
			if (map) map.remove();
		};
	}, [lat, lon]);

	return (
		<div className="space-y-2">
			{state === 'error' && <Alert type="error" message="Harita yüklenemedi." />}
			<div className="relative h-72 w-full overflow-hidden rounded border border-border-light">
				{state === 'loading' && <Skeleton className="absolute inset-0 h-full w-full" />}
				<div ref={containerRef} className="h-full w-full" aria-label="İlanın yaklaşık konumu" />
			</div>
			<p className="text-sm text-text-secondary">
				Yaklaşık konum gösteriliyor; tam adres ilan sahibiyle görüşülerek öğrenilir.
			</p>
		</div>
	);
};

export default RealEstateMap;
