import { create } from 'zustand'

interface UIState {
  bottomSheetState: 'peek' | 'half' | 'full'
  setBottomSheetState: (state: 'peek' | 'half' | 'full') => void
  activeTab: 'explore' | 'map' | 'saved' | 'profile'
  setActiveTab: (tab: 'explore' | 'map' | 'saved' | 'profile') => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  selectedPOIId: string | null
  setSelectedPOIId: (id: string | null) => void
  mapFilter: string | null
  setMapFilter: (filter: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  bottomSheetState: 'peek',
  setBottomSheetState: (bottomSheetState) => set({ bottomSheetState }),
  activeTab: 'explore',
  setActiveTab: (activeTab) => set({ activeTab }),
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  selectedPOIId: null,
  setSelectedPOIId: (selectedPOIId) => set({ selectedPOIId }),
  mapFilter: null,
  setMapFilter: (mapFilter) => set({ mapFilter }),
}))
