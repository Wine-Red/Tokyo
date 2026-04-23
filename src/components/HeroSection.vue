<template>
  <div class="relative w-full h-full flex flex-col justify-end overflow-hidden bg-white border-b-4 border-black group">
    <!-- Background Texture -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <img src="/icons/arena2.jpg" alt="Tokyo Arena" class="w-full h-full object-cover object-[68%_center] md:object-center opacity-50 transition-transform duration-[10000ms] ease-out scale-100 group-hover:scale-110" />
      <div class="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
    </div>
    
    <!-- Top Centered Logo (Sky Area) -->
    <div class="absolute top-4 md:top-12 left-0 right-0 z-20 flex justify-center w-full px-4 pt-4 md:pt-8 pointer-events-none mt-8 md:mt-0 animate-fade-in-down">
      <img src="/icons/OWCS_Tokyo.png" alt="OWCS Logo" class="h-32 sm:h-40 md:h-48 lg:h-56 w-auto drop-shadow-[0_10px_20px_rgba(255,255,255,0.8)] animate-float" />
    </div>
    
    <!-- Content -->
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pb-16 flex flex-col items-start mt-auto">
      <h1 class="font-orbitron font-black text-6xl md:text-[8rem] leading-none text-black tracking-tighter uppercase mb-4 flex flex-col">
        <span class="animate-slide-up" style="animation-delay: 200ms;"><span class="text-brand-orange">Tokyo</span></span>
        <span class="text-transparent animate-slide-up" style="-webkit-text-stroke: 2px black; animation-delay: 400ms;">2026</span>
      </h1>
      
      <div class="flex flex-col md:flex-row md:items-end justify-between w-full mt-8 border-t-2 border-black pt-6 gap-6 overflow-hidden">
        <p class="font-inter font-bold text-xl md:text-3xl text-black uppercase max-w-lg leading-tight animate-fade-in-right" style="animation-delay: 600ms;">
          守望先锋全球冠军赛<br/>
          <span class="text-gray-500 font-medium text-base md:text-xl mt-2 block">Overwatch Champions Clash</span>
        </p>
        
        <div class="flex flex-col gap-3 text-sm md:text-base font-inter font-bold text-black uppercase tracking-widest text-left md:text-right animate-fade-in-left" style="animation-delay: 800ms;">
          <div class="flex items-center md:justify-end gap-3">
            <span class="text-brand-orange">///</span>
            <span>{{ tournament.dates }}</span>
          </div>
          <div class="flex items-center md:justify-end gap-3">
            <span class="text-brand-orange">///</span>
            <span>{{ tournament.location }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Abstract graphic element -->
    <div class="absolute top-0 -right-10 w-[60%] md:w-[50%] lg:w-[40%] h-full bg-brand-orange mix-blend-multiply opacity-10 transform skew-x-12 translate-x-1/3 z-0 pointer-events-none"></div>
  </div>
</template>

<script setup>
defineProps({
  tournament: {
    type: Object,
    required: true
  }
})
</script>
