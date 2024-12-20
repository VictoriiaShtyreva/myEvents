import React, { useEffect, useRef } from "react";

interface EventMapProps {
  events: Array<{
    id: string;
    name: string;
    summary: string;
    location: {
      latitude?: number;
      longitude?: number;
      city: string;
      country: string;
      post_code?: string;
    };
  }>;
}

const EventMap: React.FC<EventMapProps> = ({ events }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 60.1699, lng: 24.9384 },
        zoom: 5,
      });

      events.forEach((event) => {
        if (event.location.latitude !== undefined && event.location.longitude !== undefined) {
          const marker = new google.maps.Marker({
            position: { lat: event.location.latitude, lng: event.location.longitude },
            map,
            title: event.name,
          });
      
          const infoWindow = new google.maps.InfoWindow({
            content: `<b>${event.name}</b><br>${event.summary}<br>${event.location.city}, ${event.location.country} ${event.location.post_code}`,
          });
      
          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        }
      });
      
    }
  }, [events]);

  return <div ref={mapRef} style={{ height: "650px", width: "100%" }}></div>;
};

export default EventMap;
