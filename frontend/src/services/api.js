// API Service for Voice Of Prophecy Virtual School
// Base URL: https://test.adventist.or.ke/api/

const BASE_URL = 'https://test.adventist.or.ke/api';

// Helper function for API calls
const fetchAPI = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
};

// Get all conferences/fields
export const getConferences = async () => {
  return fetchAPI('/conference');
};

// Get all stations
export const getStations = async () => {
  return fetchAPI('/station');
};

// Get all districts
export const getDistricts = async () => {
  return fetchAPI('/district');
};

// Get all churches
export const getChurches = async () => {
  return fetchAPI('/church');
};

// Build complete hierarchy from API data
export const buildChurchHierarchy = async () => {
  try {
    const [conferences, stations, districts, churches] = await Promise.all([
      getConferences(),
      getStations(),
      getDistricts(),
      getChurches()
    ]);

    // Build hierarchy structure
    const hierarchy = conferences.map(conference => {
      const conferenceStations = stations.filter(s => s.conf_id === conference.id);
      
      return {
        ...conference,
        stations: conferenceStations.map(station => {
          const stationDistricts = districts.filter(d => d.station_id === station.id);
          
          return {
            ...station,
            districts: stationDistricts.map(district => {
              const districtChurches = churches.filter(c => c.district_id === district.id);
              
              return {
                ...district,
                churches: districtChurches
              };
            })
          };
        })
      };
    });

    return hierarchy;
  } catch (error) {
    console.error('Error building church hierarchy:', error);
    throw error;
  }
};

// Helper functions for filtering
export const getStationsByConference = (stations, conferenceId) => {
  return stations.filter(s => s.conf_id === conferenceId);
};

export const getDistrictsByStation = (districts, stationId) => {
  return districts.filter(d => d.station_id === stationId);
};

export const getChurchesByDistrict = (churches, districtId) => {
  return churches.filter(c => c.district_id === districtId);
};

export const getChurchesByStation = (churches, districts, stationId) => {
  const stationDistricts = districts.filter(d => d.station_id === stationId);
  const districtIds = stationDistricts.map(d => d.id);
  return churches.filter(c => districtIds.includes(c.district_id));
};

export const getChurchesByConference = (churches, districts, stations, conferenceId) => {
  const conferenceStations = stations.filter(s => s.conf_id === conferenceId);
  const stationIds = conferenceStations.map(s => s.id);
  const conferenceDistricts = districts.filter(d => stationIds.includes(d.station_id));
  const districtIds = conferenceDistricts.map(d => d.id);
  return churches.filter(c => districtIds.includes(c.district_id));
};
