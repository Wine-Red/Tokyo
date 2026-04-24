<template>
  <div class="relative w-full pt-8 md:pt-16 pb-4 mb-8 overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img :src="getImageUrl('icons/arena1.jpg')" alt="Tournament Arena" class="w-full h-full object-cover object-[center_20%] md:object-[center_35%] opacity-60" />
      <div class="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-[#fafafa]"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 px-6 md:px-12 max-w-7xl mx-auto shrink-0">
      <div class="flex flex-col md:flex-row items-start md:items-end justify-between border-b-4 border-black pb-4 gap-6 animate-fade-in-up">
        <div class="shrink-0">
          <h2 class="font-orbitron font-black text-4xl md:text-6xl uppercase tracking-tighter text-black leading-none mb-2">巅峰对决</h2>
          <p class="font-orbitron font-bold text-gray-400 tracking-widest text-sm md:text-base uppercase">The Clash of Titans</p>
        </div>
        
        <p class="font-inter font-medium text-black text-sm md:text-base max-w-lg lg:max-w-xl text-left md:text-right leading-relaxed border-l-4 border-brand-orange pl-4 md:border-l-0 md:pl-0 md:border-r-4 md:pr-4">
          来自全球 4 个赛区的 <span class="font-orbitron font-bold text-xl">{{ teamsCount }}</span> 支精英战队齐聚 <span class="font-bold border-b-2 border-black">{{ location }}</span>，争夺 <span class="font-bold text-brand-orange">2026冠军系列赛第一阶段</span> 的<span class="font-bold text-lg md:text-xl ml-1">冠军宝座</span>。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getImageUrl } from '../utils/image'

defineProps({
  teamsCount: Number,
  prizePool: String,
  location: String
})
</script>
