<template>
  <div class="px-6 md:px-12 max-w-5xl mx-auto h-full flex flex-col justify-start md:justify-center">
    <div class="flex flex-col gap-6 md:gap-8 pb-8">
      <div v-for="(region, index) in regions" :key="region.id" class="flex flex-col gap-3 animate-fade-in-up" :class="`stagger-${index + 1}`">
        <!-- Region Header -->
        <div class="flex items-center justify-between border-b-2 border-black pb-2">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 flex items-center justify-center shrink-0">
              <img :src="`/${region.icon}`" :alt="region.name" class="max-w-full max-h-full object-contain" />
            </div>
            <h3 class="font-orbitron font-black text-xl md:text-2xl text-black uppercase tracking-tighter leading-none">{{ region.name }}</h3>
          </div>
          <span class="font-orbitron font-bold text-gray-400 text-[10px] md:text-xs tracking-widest uppercase">REGION / {{ region.id }}</span>
        </div>
        
        <!-- Teams -->
        <div class="grid grid-cols-2 gap-4 md:gap-6">
          <button
            v-for="team in getTeamsByRegion(region.id)"
            :key="team.id"
            @click="$emit('select-team', team.id)"
            class="relative flex flex-row items-center p-3 md:p-4 bg-white border-2 border-black hover:bg-black hover:text-white transition-all duration-200 group text-left gap-3 md:gap-5 min-h-[70px] md:min-h-[80px]"
          >
            <div class="absolute top-0 right-0 px-2 py-0.5 text-[10px] md:text-xs font-orbitron font-black uppercase tracking-wider border-b-2 border-l-2 border-black group-hover:border-white transition-colors duration-200 z-10"
                 :class="getTextColorClass(region.id)"
                 :style="{ backgroundColor: getRegionColor(region.id) }">
              {{ team.seed.split(' ')[1] }}
            </div>
            <img :src="`/${team.logo}`" :alt="team.name" class="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform duration-300 group-hover:scale-105 shrink-0" />
            <span class="flex-1 min-w-0 font-orbitron font-bold text-[10px] sm:text-xs md:text-sm leading-tight uppercase tracking-tight break-words">{{ team.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  regions: {
    type: Array,
    required: true
  },
  teams: {
    type: Array,
    required: true
  }
})

defineEmits(['select-team'])

const getTeamsByRegion = (regionId) => {
  return props.teams.filter(t => t.region === regionId)
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
  if (regionId === 'CN' || regionId === 'EMEA') {
    return 'text-black'
  }
  return 'text-white'
}
</script>
