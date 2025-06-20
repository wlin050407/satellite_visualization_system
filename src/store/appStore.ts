import { create } from 'zustand'

interface AppState {
  // 控制参数
  timeSpeed: number
  showOrbits: boolean
  showLabels: boolean
  
  // 选中的对象
  selectedSatellite: string | null
  selectedGroundStation: string | null
  
  // 操作函数
  setTimeSpeed: (speed: number) => void
  setShowOrbits: (show: boolean) => void
  setShowLabels: (show: boolean) => void
  setSelectedSatellite: (id: string | null) => void
  setSelectedGroundStation: (id: string | null) => void

  // 新增：地球自转跟随开关
  followEarthRotation: boolean
  setFollowEarthRotation: (follow: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  timeSpeed: 1.0,
  showOrbits: true,
  showLabels: true,
  selectedSatellite: null,
  selectedGroundStation: null,
  
  // 操作函数
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  setShowOrbits: (show) => set({ showOrbits: show }),
  setShowLabels: (show) => set({ showLabels: show }),
  setSelectedSatellite: (id) => set({ selectedSatellite: id }),
  setSelectedGroundStation: (id) => set({ selectedGroundStation: id }),

  // 新增：默认跟随地球自转
  followEarthRotation: true,
  setFollowEarthRotation: (follow) => set({ followEarthRotation: follow }),
})) 