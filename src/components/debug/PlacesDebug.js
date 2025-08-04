import React from 'react';
import { useQuery } from 'react-query';
import { placesAPI } from '../../services/api';

const PlacesDebug = () => {
  const { data: placesData, isLoading, error } = useQuery(
    'debug-places',
    () => placesAPI.getPlaces({ limit: 5 }),
    {
      onSuccess: (data) => {
        console.log('✅ Places API Success:', data);
      },
      onError: (error) => {
        console.error('❌ Places API Error:', error);
      }
    }
  );

  console.log('🔍 PlacesDebug State:', {
    data: placesData,
    loading: isLoading,
    error: error,
    places: placesData?.places || placesData,
    placesCount: Array.isArray(placesData?.places) ? placesData.places.length : 
                 Array.isArray(placesData) ? placesData.length : 0
  });

  if (isLoading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold text-blue-800">🔄 Loading Places...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="font-bold text-red-800">❌ Error Loading Places</h3>
        <p className="text-red-600">{error.message}</p>
      </div>
    );
  }

  const places = placesData?.places || placesData || [];

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded">
      <h3 className="font-bold text-green-800 mb-2">
        ✅ Places API Debug ({places.length} places)
      </h3>
      
      <div className="space-y-2">
        <div>
          <strong>Raw Data Type:</strong> {typeof placesData}
        </div>
        <div>
          <strong>Is Array:</strong> {Array.isArray(placesData) ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Has 'places' property:</strong> {placesData?.places ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>Places Count:</strong> {places.length}
        </div>
        
        {places.length > 0 && (
          <div>
            <strong>Sample Places:</strong>
            <ul className="list-disc list-inside ml-2 mt-1">
              {places.slice(0, 3).map((place, index) => (
                <li key={index} className="text-sm">
                  {place.name} - {place.type} - Rating: {place.rating || 'N/A'}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <details className="mt-2">
          <summary className="cursor-pointer font-medium">View Raw Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(placesData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default PlacesDebug;