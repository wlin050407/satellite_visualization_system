import { create } from 'zustand'

export interface SatelliteData {
  id: string
  name: string
  position: [number, number, number]
  velocity: [number, number, number]
  orbit: {
    altitude: number
    inclination: number
    eccentricity: number
  }
  status: 'online' | 'offline' | 'warning'
  lastUpdate: Date
  tle?: {
    line1: string
    line2: string
  }
}

export interface GroundStation {
  id: string
  name: string
  position: [number, number] // [longitude, latitude]
  elevation: number
  status: 'active' | 'inactive'
  passData?: {
    nextPass: Date
    duration: number
    maxElevation: number
  }
}

interface SatelliteStore {
  // State
  satellites: SatelliteData[]
  selectedSatellite: SatelliteData | null
  groundStations: GroundStation[]
  selectedGroundStation: GroundStation | null
  isLoading: boolean
  timeSpeed: number
  currentTime: Date
  showOrbits: boolean
  showLabels: boolean
  
  // Actions
  setSatellites: (satellites: SatelliteData[]) => void
  setSelectedSatellite: (satellite: SatelliteData | null) => void
  setGroundStations: (stations: GroundStation[]) => void
  setSelectedGroundStation: (station: GroundStation | null) => void
  setLoading: (loading: boolean) => void
  setTimeSpeed: (speed: number) => void
  setCurrentTime: (time: Date) => void
  setShowOrbits: (show: boolean) => void
  setShowLabels: (show: boolean) => void
  updateSatellitePosition: (id: string, position: [number, number, number]) => void
  initializeDemoData: () => void
}

export const useSatelliteStore = create<SatelliteStore>((set, get) => ({
  // Initial state
  satellites: [],
  selectedSatellite: null,
  groundStations: [],
  selectedGroundStation: null,
  isLoading: false,
  timeSpeed: 1,
  currentTime: new Date(),
  showOrbits: true,
  showLabels: true,

  // Actions
  setSatellites: (satellites) => set({ satellites }),
  
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),
  
  setGroundStations: (stations) => set({ groundStations: stations }),
  
  setSelectedGroundStation: (station) => set({ selectedGroundStation: station }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setShowOrbits: (show) => set({ showOrbits: show }),
  
  setShowLabels: (show) => set({ showLabels: show }),
  
  updateSatellitePosition: (id, position) => set((state) => ({
    satellites: state.satellites.map(sat => 
      sat.id === id ? { ...sat, position } : sat
    )
  })),

  initializeDemoData: () => {
    const demoSatellites: SatelliteData[] = [
      {
        id: 'iss',
        name: 'International Space Station',
        position: [6.8, 0, 0],
        velocity: [0, 0, 7.66],
        orbit: { altitude: 408, inclination: 51.6, eccentricity: 0.0003 },
        status: 'online',
        lastUpdate: new Date(),
        tle: {
          line1: '1 25544U 98067A   21001.00000000  .00001000  00000-0  23713-4 0  9990',
          line2: '2 25544  51.6456 339.2000 0002829  48.3000  23.4000 15.48919103000000'
        }
      },
      {
        id: 'hubble',
        name: 'Hubble Space Telescope',
        position: [-5.5, 2.8, -3.2],
        velocity: [0, 0, 7.59],
        orbit: { altitude: 547, inclination: 28.5, eccentricity: 0.0003 },
        status: 'online',
        lastUpdate: new Date()
      },
      {
        id: 'starlink-1',
        name: 'Starlink-1007',
        position: [4.2, -1.5, 4.8],
        velocity: [0, 0, 7.53],
        orbit: { altitude: 550, inclination: 53.0, eccentricity: 0.0001 },
        status: 'online',
        lastUpdate: new Date()
      },
      {
        id: 'starlink-2',
        name: 'Starlink-1245',
        position: [-3.8, 3.2, -2.1],
        velocity: [0, 0, 7.53],
        orbit: { altitude: 550, inclination: 53.0, eccentricity: 0.0001 },
        status: 'warning',
        lastUpdate: new Date()
      },
      {
        id: 'gps-1',
        name: 'GPS BIIR-2',
        position: [8.5, -4.2, 6.1],
        velocity: [0, 0, 3.87],
        orbit: { altitude: 20200, inclination: 55.0, eccentricity: 0.01 },
        status: 'online',
        lastUpdate: new Date()
      },
      {
        id: 'tiangong',
        name: 'Tiangong Space Station',
        position: [5.8, 3.5, -2.8],
        velocity: [0, 0, 7.66],
        orbit: { altitude: 340, inclination: 41.5, eccentricity: 0.0005 },
        status: 'online',
        lastUpdate: new Date()
      }
    ]

    const demoGroundStations: GroundStation[] = [
      {
        id: 'singapore',
        name: 'Singapore Ground Station',
        position: [103.8198, 1.3521],
        elevation: 15,
        status: 'active',
        passData: {
          nextPass: new Date(Date.now() + 2 * 60 * 60 * 1000),
          duration: 600,
          maxElevation: 45
        }
      },
      {
        id: 'kennedy',
        name: 'Kennedy Space Center',
        position: [-80.6041, 28.5721],
        elevation: 3,
        status: 'active'
      },
      {
        id: 'beijing',
        name: 'Beijing Aerospace Control',
        position: [116.4074, 39.9042],
        elevation: 44,
        status: 'active'
      }
    ]

    set({ 
      satellites: demoSatellites, 
      groundStations: demoGroundStations,
      selectedSatellite: demoSatellites[0]
    })
  }
})) 