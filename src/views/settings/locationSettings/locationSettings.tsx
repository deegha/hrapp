import dynamic from "next/dynamic";

const DynamicGoogleTargetLocationSetter = dynamic(() => import("./googleTargetLocationSetter"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <p className="text-lg font-semibold text-gray-700">Loading map...</p>
      <p className="text-sm text-gray-500">Waiting for Google Maps API to load.</p>
    </div>
  ),
});

export function LocationSettings() {
  return <DynamicGoogleTargetLocationSetter />;
}
