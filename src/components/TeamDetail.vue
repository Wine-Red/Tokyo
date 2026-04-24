<template>
  <div class="w-full">
    <!-- Back Button & Team Header -->
    <div class="w-full bg-[#0b1325] text-white relative overflow-hidden flex flex-col mb-12 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]"
         :style="{ backgroundColor: team.themeColor || '#0b1325' }">
      
      <!-- Huge Background Logo -->
      <div class="absolute right-0 bottom-0 translate-y-[10%] translate-x-[20%] md:translate-x-[10%] w-[80%] md:w-[70%] lg:w-[50%] h-[80%] md:h-full opacity-[0.15] select-none z-0 pointer-events-none flex items-end md:items-center justify-end mix-blend-luminosity">
        <img :src="getImageUrl(team.logo)" :alt="team.name" class="w-full h-full object-contain grayscale" />
      </div>

      <!-- Top Bar -->
      <div class="flex justify-between items-center px-6 md:px-12 lg:px-24 py-5 z-10 border-b border-white/5">
        <button @click="$emit('back')" class="inline-flex items-center gap-2 hover:text-gray-300 transition-colors font-inter text-sm text-white/70">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          返回名录
        </button>
        <span class="font-orbitron font-bold text-sm tracking-widest text-white/40 uppercase">{{ region.id }} #{{ team.seed.split(' ')[1]?.replace('#', '') || '1' }}</span>
      </div>

      <!-- Main Content -->
      <div class="flex flex-col md:flex-row items-center md:items-stretch justify-between px-6 md:px-12 lg:px-24 py-8 md:py-12 z-10 flex-1 gap-8 md:gap-16">
        
        <!-- Left Side Info -->
        <div class="flex flex-col justify-center max-w-2xl w-full z-10 relative">
          <div class="text-sm font-inter text-white/50 mb-2 tracking-wide flex items-center gap-2">
            <span class="font-orbitron uppercase whitespace-nowrap">{{ region.id }} #{{ team.seed.split(' ')[1]?.replace('#', '') || '1' }}</span>
            <span class="w-1 h-1 rounded-full bg-white/30"></span>
            <span class="whitespace-nowrap">第一赛段</span>
          </div>
          <h2 class="font-orbitron font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tighter mb-4 leading-none break-words">{{ team.name }}</h2>
          <p v-if="team.description" class="font-inter text-white/80 text-sm md:text-base leading-relaxed mb-6 max-w-lg">
            {{ team.description }}
          </p>
          
          <div class="flex items-center gap-3 mb-8 md:mb-12">
            <div class="px-4 py-1 font-orbitron font-bold text-xs uppercase tracking-widest border border-white/20 rounded-full bg-white/5 backdrop-blur-sm">
              {{ region.id }}
            </div>
            <div class="px-4 py-1 font-orbitron font-bold text-xs uppercase tracking-widest border border-white/20 rounded-full bg-white/5 backdrop-blur-sm">
              {{ team.stats || '0W-0L' }}
            </div>
          </div>
          
          <!-- Bottom Left Rank -->
          <div class="mt-auto border-t border-white/10 pt-4 w-full flex items-end justify-between">
            <div>
              <div class="text-[10px] text-white/50 font-orbitron tracking-widest uppercase mb-1">{{ region.id }} REGIONAL RANK</div>
              <div class="font-orbitron font-bold text-2xl text-white">#{{ team.seed.split(' ')[1]?.replace('#', '') || '1' }}</div>
            </div>
            <div class="text-[10px] text-white/40 font-orbitron tracking-widest uppercase">
              S1 2026.03 &rarr; 2026.05
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Roster Display -->
    <div class="px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
      
      <!-- Team Stats Card (Full Width on Mobile, Col Span 12) -->
      <div class="lg:col-span-12 bg-white border-2 border-black p-4 md:p-6 grid grid-cols-2 md:flex md:flex-row justify-between gap-y-4 gap-x-6 md:gap-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-fade-in-up">
        <div class="flex flex-col gap-1">
          <span class="font-inter text-[10px] md:text-xs text-gray-500 font-bold tracking-widest uppercase">MATCH W-L</span>
          <span class="font-orbitron font-black text-xl md:text-3xl">{{ team.stats || '0W-0L' }}</span>
        </div>
        <div class="hidden md:block w-px bg-black/10"></div>
        <div class="flex flex-col gap-1">
          <span class="font-inter text-[10px] md:text-xs text-gray-500 font-bold tracking-widest uppercase">MAP W-L</span>
          <span class="font-orbitron font-black text-xl md:text-3xl text-gray-600">{{ team.mapStats || '0W-0L' }}</span>
        </div>
        <div class="hidden md:block w-px bg-black/10"></div>
        <div class="flex flex-col gap-1">
          <span class="font-inter text-[10px] md:text-xs text-gray-500 font-bold tracking-widest uppercase">TEAM K/D</span>
          <span class="font-orbitron font-black text-xl md:text-3xl text-brand-orange">{{ team.kd || '0.00' }}</span>
        </div>
        <div class="hidden md:block w-px bg-black/10"></div>
        <div class="flex flex-col gap-1">
          <span class="font-inter text-[10px] md:text-xs text-gray-500 font-bold tracking-widest uppercase">ELIM / 10MIN</span>
          <span class="font-orbitron font-black text-xl md:text-3xl">{{ team.elimPer10 || '0.0' }}</span>
        </div>
      </div>

      <!-- Player List -->
      <div class="lg:col-span-5 flex flex-col gap-2 md:gap-3 animate-fade-in-right" style="animation-delay: 200ms;">
        <div class="border-b-4 border-black pb-2 mb-2">
          <h3 class="font-orbitron font-black text-3xl uppercase tracking-tighter">Roster</h3>
        </div>
        
        <div v-for="roleGroup in teamPlayersByRole" :key="roleGroup.roleName" class="grid grid-cols-2 md:flex md:flex-col gap-2 md:gap-3">
          <div 
            v-for="player in roleGroup.players" 
            :key="player.id"
            @click="activePlayerId = player.id"
            class="flex items-center justify-between p-2.5 md:p-3 border-2 transition-all cursor-pointer select-none group relative"
            :class="[
              activePlayerId === player.id 
                ? 'border-black bg-black text-white' 
                : 'border-black/10 bg-white hover:border-black text-black'
            ]"
          >
            <div class="flex items-center gap-2 md:gap-4 w-full min-w-0">
              <div class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
                <img :src="getImageUrl(getRoleIcon(player.role))" :alt="player.role" class="w-5 h-5 md:w-6 md:h-6 object-contain transition-all duration-300" 
                     :style="activePlayerId === player.id ? 'filter: brightness(0) invert(1); opacity: 1;' : 'filter: brightness(0); opacity: 1;'" />
              </div>
              <div class="flex-1 overflow-hidden">
                <div class="font-orbitron font-bold text-sm md:text-lg uppercase tracking-wide truncate">{{ player.name }}</div>
              </div>
            </div>
            
            <div class="flex items-center justify-center transition-transform shrink-0" 
                 :class="[activePlayerId === player.id ? 'text-brand-orange translate-x-1' : 'text-transparent group-hover:text-black group-hover:translate-x-0.5']">
              <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Radar Chart Panel -->
      <div class="lg:col-span-7 flex flex-col animate-fade-in-left" style="animation-delay: 400ms;">
        <div class="border-b-4 border-black pb-2 mb-6 flex justify-between items-end">
          <h3 class="font-orbitron font-black text-3xl uppercase tracking-tighter">Stats</h3>
          <span v-if="activePlayer" class="font-inter font-bold text-sm text-gray-500 uppercase tracking-widest">
            {{ activePlayer.name }}
          </span>
        </div>
        
        <div class="bg-white border-4 border-black p-8 flex-1 relative min-h-[400px] flex flex-col shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div class="absolute top-0 left-0 px-4 py-2 bg-black text-white font-orbitron font-bold text-xl uppercase tracking-widest z-10">
            {{ activePlayer?.name || 'SELECT' }}
          </div>
          
          <div class="flex-1 mt-8">
            <PlayerRadarChart v-if="activePlayer" :player="activePlayer" :allPlayers="players" />
            <div v-else class="h-full flex flex-col items-center justify-center text-center opacity-50">
              <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <span class="font-orbitron font-bold text-lg uppercase tracking-widest">Awaiting Selection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import PlayerRadarChart from './PlayerRadarChart.vue'
import { getImageUrl } from '../utils/image'

const props = defineProps({
  team: {
    type: Object,
    required: true
  },
  players: {
    type: Array,
    required: true
  },
  regions: {
    type: Array,
    required: true
  }
})

defineEmits(['back'])

const activePlayerId = ref(null)

const teamPlayersByRole = computed(() => {
  const players = props.players.filter(p => p.teamId === props.team.id)
  
  const tank = players.filter(p => p.role === 'Tank')
  const dps = players.filter(p => p.role === 'DPS')
  const support = players.filter(p => p.role === 'Support')
  
  return [
    { roleName: 'Tank', players: tank },
    { roleName: 'DPS', players: dps },
    { roleName: 'Support', players: support }
  ].filter(group => group.players.length > 0)
})

const region = computed(() => {
  return props.regions.find(r => r.id === props.team.region) || {}
})

const activePlayer = computed(() => {
  return props.players.find(p => p.id === activePlayerId.value) || null
})

// Auto-select first player when team changes
watch(() => props.team.id, () => {
  const players = props.players.filter(p => p.teamId === props.team.id)
  if (players.length > 0) {
    // Try to select the first Tank, otherwise just the first player
    const firstTank = players.find(p => p.role === 'Tank')
    activePlayerId.value = firstTank ? firstTank.id : players[0].id
  } else {
    activePlayerId.value = null
  }
}, { immediate: true })

const getRoleIcon = (role) => {
  const map = {
    'DPS': 'role/DPS.png',
    'Tank': 'role/Tank.png',
    'Support': 'role/Support.png'
  }
  return map[role] || 'role/DPS.png'
}

const getRoleName = (role) => {
  const map = {
    'DPS': '输出',
    'Tank': '重装',
    'Support': '支援'
  }
  return map[role] || role
}

const getRegionColor = (regionId) => {
  const colors = {
    'CN': '#fcc731',
    'Asia': '#f2190d',
    'NA': '#8735f0',
    'EMEA': '#1fc3c4'
  }
  return colors[regionId] || '#000000'
}

const getTextColorClass = (regionId) => {
  // For lighter colors like CN's yellow and EMEA's cyan, use black text. 
  // For darker ones like Asia's red and NA's purple, use white text.
  if (regionId === 'CN' || regionId === 'EMEA') {
    return 'text-black'
  }
  return 'text-white'
}
</script>
