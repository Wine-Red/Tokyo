<template>
  <div class="text-black bg-[#fafafa] h-screen w-full overflow-hidden font-inter relative">
    <main class="h-full w-full">
      <Transition name="fade" mode="out-in" @enter="onEnter" @after-enter="onAfterEnter">
        <div :key="currentView" class="h-full w-full">
          <!-- Full Page Scroll Container for Home -->
          <div v-if="currentView === 'home'" 
               :class="['h-full w-full overflow-y-auto snap-y snap-mandatory relative', { 'scroll-smooth': enableSmoothScroll }]" 
               ref="scrollContainer">
            
            <!-- Section 1: Hero -->
            <section class="h-screen w-full snap-start relative">
              <HeroSection :tournament="mockData.tournament" />
            </section>

            <!-- Section 2: Teams Grid -->
            <section class="min-h-screen w-full snap-start bg-[#fafafa] flex flex-col relative pb-20">
              <TournamentInfo 
                :teamsCount="mockData.tournament.teamsCount"
                :prizePool="mockData.tournament.prizePool"
                :location="mockData.tournament.location"
              />
              <div class="flex-1 px-2 pb-8">
                <TeamGrid 
                  :teams="mockData.teams" 
                  :regions="mockData.regions"
                  @select-team="goToTeam"
                />
              </div>
              
              <!-- DIY Button at the very bottom center -->
              <div class="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <button @click="goToDiy" class="pointer-events-auto bg-brand-orange text-white px-8 py-3 font-orbitron font-bold text-base hover:bg-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none z-50">
                  ✦ DIY 梦之队
                </button>
              </div>
            </section>
          </div>

          <!-- Team Detail View -->
          <div v-else-if="currentView === 'team'" class="h-full w-full overflow-y-auto bg-[#fafafa]">
            <TeamDetail 
              :team="selectedTeam" 
              :players="mockData.players" 
              :regions="mockData.regions"
              @back="goHome(true)"
            />
          </div>

          <!-- DIY Dream Team View -->
          <div v-else-if="currentView === 'diy'" class="h-full w-full overflow-y-auto bg-[#fafafa]">
            <DiyPage @back="goHome(false)" />
          </div>
        </div>
      </Transition>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import mockDataRaw from './data/mockData.json'

import HeroSection from './components/HeroSection.vue'
import TournamentInfo from './components/TournamentInfo.vue'
import TeamGrid from './components/TeamGrid.vue'
import TeamDetail from './components/TeamDetail.vue'
import DiyPage from './components/DiyPage.vue'

const mockData = ref(mockDataRaw)
const currentView = ref('home')
const selectedTeamId = ref(null)
const scrollContainer = ref(null)

const enableSmoothScroll = ref(true)
const pendingScrollIndex = ref(null)

const goToTeam = (teamId) => {
  selectedTeamId.value = teamId
  currentView.value = 'team'
}

const goToDiy = () => {
  currentView.value = 'diy'
}

const goHome = (scrollToTeams = false) => {
  if (currentView.value === 'home' && !scrollToTeams) {
    scrollToSection(0)
    return
  }
  currentView.value = 'home'
  selectedTeamId.value = null
  if (scrollToTeams) {
    enableSmoothScroll.value = false
    pendingScrollIndex.value = 1
  } else {
    enableSmoothScroll.value = true
    pendingScrollIndex.value = null
  }
}

const onEnter = (el) => {
  if (currentView.value === 'home' && pendingScrollIndex.value !== null) {
    // Wait for the next frame to ensure DOM layout is complete
    requestAnimationFrame(() => {
      const container = el.querySelector('.overflow-y-auto')
      if (container) {
        const sections = container.querySelectorAll('section')
        if (sections[pendingScrollIndex.value]) {
          container.scrollTo({
            top: sections[pendingScrollIndex.value].offsetTop,
            behavior: 'instant'
          })
        }
      }
    })
  }
}

const onAfterEnter = () => {
  if (currentView.value === 'home') {
    setTimeout(() => {
      enableSmoothScroll.value = true
      pendingScrollIndex.value = null
    }, 50)
  }
}

const scrollToSection = (index) => {
  if (!scrollContainer.value) return
  const sections = scrollContainer.value.querySelectorAll('section')
  if (sections[index]) {
    sections[index].scrollIntoView({ behavior: 'smooth' })
  }
}

const selectedTeam = computed(() => {
  return mockData.value.teams.find(t => t.id === selectedTeamId.value)
})
</script>

<style>
/* Removed html scroll-behavior smooth since we use container scrolling now */
</style>
