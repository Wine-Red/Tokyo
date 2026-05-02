<template>
  <div class="diy-page text-black bg-white h-screen w-full overflow-hidden font-inter relative flex flex-col">
    <!-- TOP NAV -->
    <nav class="nav">
      <div class="nav-logo">OWCS <span>Tokyo</span> 2026</div>
      <button @click="$emit('back')" class="btn-back">← 返回赛事页</button>
    </nav>

    <!-- HERO -->
    <header class="hero" style="max-width:1280px;margin:0 auto;width:100%;">
      <h1>组建<br><span>梦之队</span></h1>
      <p>从 {{ TEAMS.length }} 支参赛战队 {{ PLAYERS.length }} 名选手中，挑选你心仪的阵容。<br>
         <strong>至少 1 重装 · 2 输出 · 2 支援</strong> — 最多 7 人。</p>
    </header>

    <!-- MAIN -->
    <div class="page-wrap flex-1 overflow-y-auto">
      <!-- LEFT: ROSTER -->
      <div class="roster-panel">
        <div class="section-title">选择选手 · 全部阵容</div>

        <div class="filter-bar">
          <button :class="['filter-btn', { active: currentFilter === 'all' }]" @click="setFilter('all')">全部</button>
          <button :class="['filter-btn', { active: currentFilter === 'Tank' }]" @click="setFilter('Tank')">
            <img :src="getImageUrl('role/Tank.png')" alt="Tank" class="w-4 h-4 object-contain" :style="currentFilter === 'Tank' ? 'filter: brightness(0) invert(1);' : 'filter: brightness(0) sepia(1) hue-rotate(200deg) saturate(3) brightness(0.9);'" />
          </button>
          <button :class="['filter-btn', { active: currentFilter === 'DPS' }]" @click="setFilter('DPS')">
            <img :src="getImageUrl('role/DPS.png')" alt="DPS" class="w-4 h-4 object-contain" :style="currentFilter === 'DPS' ? 'filter: brightness(0) invert(1);' : 'filter: brightness(0) sepia(1) hue-rotate(340deg) saturate(3) brightness(0.9);'" />
          </button>
          <button :class="['filter-btn', { active: currentFilter === 'Support' }]" @click="setFilter('Support')">
            <img :src="getImageUrl('role/Support.png')" alt="Support" class="w-4 h-4 object-contain" :style="currentFilter === 'Support' ? 'filter: brightness(0) invert(1);' : 'filter: brightness(0) sepia(1) hue-rotate(90deg) saturate(3) brightness(0.9);'" />
          </button>
        </div>

        <div id="roster-container">
          <div v-for="team in filteredTeams" :key="team.id" class="team-group">
            <div class="team-group-header">
              <img :src="resolveImage(team.logo)" :alt="team.name" @error="hideImg">
              <span class="team-name">{{ team.name }}</span>
              <span class="team-region">{{ team.region }}</span>
            </div>
            <div class="players-grid">
              <div 
                v-for="p in team.players" :key="p.id"
                :class="[
                  'player-card', 
                  { selected: isSelected(p.id), disabled: !isSelected(p.id) && !canAdd(p), shake: shakingPlayer === p.id }
                ]"
                @click="togglePlayer(p.id)"
              >
                <div class="pc-name">
                  <img :src="getImageUrl('role/' + p.role + '.png')" class="w-3.5 h-3.5 object-contain" :style="`filter: brightness(0) sepia(1) hue-rotate(${p.role === 'Tank' ? '200' : p.role === 'DPS' ? '340' : '90'})deg saturate(3) brightness(0.9); opacity: 0.9;`" />
                  {{ p.name }}
                </div>
                <span class="pc-check">✔</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: TEAM PANEL (desktop only) -->
      <div class="team-panel-desktop">
        <div class="team-panel-box">
          <div class="team-panel-header">我的战队阵容</div>
          <div class="team-panel-body">
            <TeamPanelBody />
          </div>
        </div>
      </div>
    </div><!-- /page-wrap -->

    <!-- MOBILE BOTTOM BAR -->
    <div class="mobile-bottom-bar">
      <div class="mbb-progress">
        <div class="mbb-progress-row">
          <span class="mbb-label">阵容</span>
          <span class="mbb-count">{{ selected.length }}/7</span>
        </div>
        <div class="mbb-pips">
          <div v-for="(pip, i) in mobilePips" :key="i"
               :class="['mbb-pip', { filled: pip.filled }]"
               :style="pip.filled ? `background: ${pip.color}` : ''"></div>
        </div>
        <div class="mbb-bar-wrap">
          <div class="mbb-bar" :style="`width:${Math.round(selected.length/7*100)}%`"></div>
        </div>
      </div>
      <button class="mbb-btn" @click="openSheet">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mbb-btn-icon"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
        阵容
      </button>
      <button class="mbb-confirm" :disabled="!isValidTeam" @click="confirmTeam">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mbb-confirm-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        确认
      </button>
    </div>

    <!-- BOTTOM SHEET (mobile) -->
    <div class="sheet-overlay" :class="{ open: sheetOpen }" @click="closeSheet"></div>
    <div class="bottom-sheet" :class="{ open: sheetOpen }" ref="sheetRef"
         @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
      <div class="sheet-handle-bar"><div class="sheet-handle"></div></div>
      <div class="sheet-header">
        <span class="sheet-title">我的战队阵容</span>
        <button class="sheet-close" @click="closeSheet">✕</button>
      </div>
      <div class="sheet-body">
        <TeamPanelBody />
      </div>
    </div>

    <!-- RESULT MODAL -->
    <div class="modal-overlay" :class="{ show: modalOpen }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>✦ 梦之队海报</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body" v-if="topTeam">
          <template v-if="!generatedPosterUrl">
            <div style="text-align: center; font-size: 0.95rem; color: #ea6c06; font-weight: 900; margin-bottom: 20px;">
              正在为您生成海报...
            </div>
          </template>

          <!-- Generated Poster View -->
          <template v-else>
            <div style="text-align: center; font-size: 0.95rem; color: #ea6c06; font-weight: 900; margin-bottom: 12px;">
              长按下方图片保存至手机相册
            </div>
            
            <div style="display: flex; justify-content: center; background: #e5e7eb; border-radius: 8px; padding: 20px 0; overflow: hidden; margin-bottom: 20px;">
              <img :src="generatedPosterUrl" style="max-width: 90%; height: auto; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
            </div>

            <div style="display:flex; flex-direction:column; gap:12px;">
              <a :href="mockData.tournament.links?.diyEvent || '#'" target="_blank" class="btn-primary" style="display:block; text-align:center; text-decoration:none; box-sizing:border-box;">截图或保存图片后前往参与活动 →</a>
              <button class="btn-primary" style="background:var(--black); border-color:var(--black);" @click="closeModal">← 返回调整阵容</button>
            </div>
          </template>

          <!-- Hidden Preview Container for html2canvas -->
          <div style="position: absolute; left: -9999px; top: 0; pointer-events: none; opacity: 0; overflow: hidden;">
            <div style="width: 540px; height: 960px; transform-origin: top left;">
              <div ref="posterRef" class="poster-container" style="position:relative; overflow:hidden; width:540px; height:960px; box-sizing:border-box; background: #fff;">
                
                <!-- Background Image -->
                <img :src="getImageUrl('others/poster.png')" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; z-index:0;" />

                <div style="position:relative; z-index:10; display:flex; flex-direction:column; height:100%;">
                  
                  <!-- 上半部分：标题与Logo -->
                  <div :style="`flex: 0 0 auto; display:flex; flex-direction:row; align-items:center; justify-content:space-between; padding: ${posterConfig.headerPaddingTop}px 40px 0;`">
                    <div style="text-align:left;">
                      <div :style="`font-family:'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size:${posterConfig.titleSize}rem; font-weight:900; line-height:1.1; color:#000; letter-spacing: 0.05em; text-transform: uppercase;`">
                        Tokyo 2026
                      </div>
                      <div :style="`font-family:'Noto Sans SC', 'PingFang SC', sans-serif; font-size:${posterConfig.subTitleSize}rem; font-weight:900; line-height:1.2; color:#f97316; letter-spacing: 0.2em; margin-top: 4px;`">
                        梦之队
                      </div>
                    </div>
                    <!-- 细竖线分割 -->
                    <div :style="`width: 2px; height: ${posterConfig.logoSize * 0.7}px; background-color: #e5e7eb; margin: 35px 35px 0 0;`"></div>
                    <div :style="`width:${posterConfig.logoSize * 1.3}px; height:${posterConfig.logoSize * 1.3}px; display:flex; align-items:center; justify-content:center; margin: 0 40px 0 0;`">
                      <img :src="getImageUrl('icons/OWCS_Tokyo.png')" style="max-width:100%; max-height:100%; object-fit:contain; transform: scale(1.15) translate(15px, 18px);" />
                    </div>
                  </div>
                  
                  <!-- 下半部分：阵容列表 -->
                  <div class="modal-roster" :style="`flex:1; display:flex; flex-direction:column; justify-content:flex-start; gap:${posterConfig.itemPaddingY}px; padding: 0 ${posterConfig.rosterPaddingX}px; margin-top: ${posterConfig.rosterMarginTop}px; position:relative; z-index:20;`">
                    <template v-for="g in groups" :key="g.role">
                      <div v-for="id in getSelectedByRole(g.role)" :key="id" :style="`display:flex; align-items:stretch; background:#fff; border:1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); height: ${posterConfig.cardHeight}px; width: 100%; box-sizing: border-box;`">
                        
                        <!-- Left Icon Area -->
                        <div :style="`width: ${posterConfig.cardHeight}px; display:flex; align-items:center; justify-content:center; border-right:1px solid #f3f4f6;`">
                          <div :style="`width:${posterConfig.cardHeight * 0.55}px; height:${posterConfig.cardHeight * 0.55}px; display:flex; align-items:center; justify-content:center;`">
                            <img :src="getImageUrl(`role/${getPlayer(id).role}.png`)" style="max-width:100%; max-height:100%; object-fit:contain; filter: brightness(0);" />
                          </div>
                        </div>

                        <!-- Player Info Area -->
                        <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; padding-left: 20px; transform: translateY(-6px);">
                          <div :style="`font-family:'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size:${posterConfig.cardHeight * 0.021}rem; font-weight:900; color:#000; text-transform:uppercase; letter-spacing:0.02em; line-height:1.1;`">{{ getPlayer(id).name }}</div>
                          <div style="font-family:'Noto Sans SC', 'PingFang SC', sans-serif; font-size:0.7rem; color:#9ca3af; font-weight:600; letter-spacing:0.02em; margin-top:2px;">
                            {{ getTeam(getPlayer(id).teamId).name }}
                          </div>
                        </div>

                        <!-- Right Orange Accent Block with Team Logo -->
                        <div :style="`width: ${posterConfig.cardHeight}px; background-color: #f97316; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;`">
                          <!-- Subtle dot pattern background effect -->
                          <div style="position:absolute; inset:0; opacity:0.2; background-image: radial-gradient(#000 1px, transparent 1px); background-size: 4px 4px;"></div>
                          <!-- Team Logo -->
                          <!-- 将图片包裹在一个定宽高的容器中，解决直接设置 img object-fit: contain 导致的 html2canvas 渲染拉伸问题 -->
                          <div :style="`width:${posterConfig.cardHeight * 0.65}px; height:${posterConfig.cardHeight * 0.65}px; display:flex; align-items:center; justify-content:center; position:relative; z-index:2;`">
                            <img :src="resolveImage(getTeam(getPlayer(id).teamId).logo)" style="max-width:100%; max-height:100%; object-fit:contain;" />
                          </div>
                        </div>
                        
                      </div>
                    </template>
                  </div>
                  
                  <!-- 右下角二维码 -->
                  <div style="position:absolute; bottom:60px; right:20px; z-index:30; display:flex; flex-direction:row; align-items:center; gap:8px; width: 170px; height: 100px; transform: translateX(5px);">
                    <img src="../assets/icons/godlike.png" style="width:110px; height:110px; object-fit:contain; border-radius:10px; box-shadow:0 4px 12px rgba(0,0,0,0.15);" />
                    <div style="display:flex; flex-direction:row-reverse; gap:6px; font-family:'Noto Sans SC', 'PingFang SC', sans-serif; font-weight:900; color:#000; height: 110px; transform: translateY(-8px);">
                      <!-- 右列 -->
                      <div style="font-size:1.1rem; line-height:1.1; display:flex; flex-direction:column; justify-content:flex-start; align-items:center; gap: 2px; height: 100px; padding-top: 9px; font-family: 'Noto Sans SC', 'PingFang SC', Tahoma, Geneva, sans-serif;">
                        <span>上</span><span>大</span><span>神</span>
                      </div>
                      <!-- 左列 -->
                      <div style="font-size:0.8rem; line-height:1.1; display:flex; flex-direction:column; justify-content:space-between; align-items:center; color:#374151; height: 100px; margin: 9px 0 9px 0; font-family: 'Noto Sans SC', 'PingFang SC', Tahoma, Geneva, sans-serif;">
                        <span>组</span><span>建</span><span>你</span><span>的</span><span>梦</span><span>之</span><span>队</span>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <div class="toast" :class="{ show: toastMsg !== '' }">{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import { ref, computed, h, nextTick } from 'vue'
import { getImageUrl } from '../utils/image'
import html2canvas from 'html2canvas'

const props = defineProps({
  mockData: {
    type: Object,
    required: true
  }
})

defineEmits(['back'])

// Data
const TEAMS = props.mockData.teams.map(t => ({
  id: t.id,
  name: t.name,
  region: t.region,
  logo: 'assets/' + t.logo
}))

const PLAYERS = props.mockData.players.map(p => ({
  id: p.id,
  name: p.name,
  teamId: p.teamId,
  role: p.role
}))

const QUOTA = { Tank: 1, DPS: 2, Support: 2 }
const groups = [
  { role:'Tank',   label:'重装', quota:1 },
  { role:'DPS',    label:'输出', quota:2 },
  { role:'Support',label:'支援', quota:2 },
]

// State
const selected = ref([])
const currentFilter = ref('all')
const sheetOpen = ref(false)
const modalOpen = ref(false)
const toastMsg = ref('')
const shakingPlayer = ref(null)
const posterRef = ref(null)
const isGeneratingPoster = ref(false)
const generatedPosterUrl = ref('')

const posterConfig = ref({
  headerPaddingTop: 20,
  rosterMarginTop: 60,
  rosterPaddingX: 25,
  itemPaddingY: 14,
  cardHeight: 72,
  logoSize: 200,
  titleSize: 2.8,
  subTitleSize: 2.3
})

// Helpers
const getTeam = (id) => TEAMS.find(t => t.id === id)
const getPlayer = (id) => PLAYERS.find(p => p.id === id)

const roleCounts = computed(() => {
  const c = { Tank: 0, DPS: 0, Support: 0 }
  selected.value.forEach(id => {
    const p = getPlayer(id)
    if (p) c[p.role]++
  })
  return c
})

const isValidTeam = computed(() => {
  return selected.value.length >= 5 &&
         selected.value.length <= 7 &&
         roleCounts.value.Tank >= 1 &&
         roleCounts.value.DPS >= 2 &&
         roleCounts.value.Support >= 2
})

const displayGroups = computed(() => {
  const tankPlayers = getSelectedByRole('Tank')
  const dpsPlayers = getSelectedByRole('DPS')
  const supportPlayers = getSelectedByRole('Support')

  const tankQuota = Math.max(1, tankPlayers.length)
  const dpsQuota = Math.max(2, dpsPlayers.length)
  const supportQuota = Math.max(2, supportPlayers.length)

  const flexUsed = Math.max(0, tankPlayers.length - 1) + Math.max(0, dpsPlayers.length - 2) + Math.max(0, supportPlayers.length - 2)
  const flexRemaining = 2 - flexUsed

  const res = [
    { role: 'Tank', label: '重装', quota: tankQuota, players: tankPlayers },
    { role: 'DPS', label: '输出', quota: dpsQuota, players: dpsPlayers },
    { role: 'Support', label: '支援', quota: supportQuota, players: supportPlayers },
  ]
  if (flexRemaining > 0) {
    res.push({ role: 'Flex', label: '自由', quota: flexRemaining, players: [] })
  }
  return res
})

const canAdd = (player) => {
  if (selected.value.length >= 7) return false
  const newCounts = { ...roleCounts.value }
  newCounts[player.role]++

  const deficit = Math.max(0, 1 - newCounts.Tank) +
                  Math.max(0, 2 - newCounts.DPS) +
                  Math.max(0, 2 - newCounts.Support)

  const remainingSlots = 7 - (selected.value.length + 1)
  return remainingSlots >= deficit
}

const roleColor = (role) => role === 'Tank' ? '#3b82f6' : role === 'DPS' ? '#ef4444' : '#22c55e'
const roleLabel = (role) => role === 'Tank' ? '重装' : role === 'DPS' ? '输出' : '支援'

const resolveImage = (path) => {
  // path is like "assets/teams/zeta.png"
  const cleanPath = path.replace('assets/', '')
  return getImageUrl(cleanPath)
}
const hideImg = (e) => { e.target.style.display = 'none' }

// Filtered data
const filteredTeams = computed(() => {
  return TEAMS.map(team => {
    const players = PLAYERS.filter(p => p.teamId === team.id && (currentFilter.value === 'all' || p.role === currentFilter.value))
    return { ...team, players }
  }).filter(team => team.players.length > 0)
})

// Actions
const setFilter = (f) => { currentFilter.value = f }
const isSelected = (id) => selected.value.includes(id)

let toastTimer = null
const showToast = (msg) => {
  toastMsg.value = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMsg.value = '' }, 2200)
}

const togglePlayer = (id) => {
  const p = getPlayer(id)
  if (!p) return
  if (selected.value.includes(id)) {
    selected.value = selected.value.filter(x => x !== id)
  } else {
    if (!canAdd(p)) {
      shakingPlayer.value = id
      setTimeout(() => { if (shakingPlayer.value === id) shakingPlayer.value = null }, 300)
      const msg = selected.value.length >= 7
        ? '阵容已满，最多可挑选7人'
        : '需预留位置给其他必选职责'
      showToast(msg)
      return
    }
    selected.value.push(id)
  }
}

const clearAll = () => { selected.value = [] }

const openSheet = () => {
  sheetOpen.value = true
}
const closeSheet = () => {
  sheetOpen.value = false
}

// Swipe down to close sheet
const sheetRef = ref(null)
let startY = 0
let isDragging = false
const onTouchStart = (e) => {
  startY = e.touches[0].clientY
  isDragging = true
}
const onTouchMove = (e) => {
  if (!isDragging) return
  const dy = e.touches[0].clientY - startY
  if (dy > 0 && sheetRef.value) {
    sheetRef.value.style.transform = `translateY(${dy}px)`
  }
}
const onTouchEnd = (e) => {
  if (!isDragging) return
  isDragging = false
  const dy = e.changedTouches[0].clientY - startY
  if (sheetRef.value) sheetRef.value.style.transform = ''
  if (dy > 80) closeSheet()
}

// Modal
const topTeam = computed(() => {
  if (!isValidTeam.value) return null
  const tally = {}
  selected.value.forEach(id => {
    const p = getPlayer(id)
    tally[p.teamId] = (tally[p.teamId] || 0) + 1
  })
  const topTeamId = Object.keys(tally).sort((a,b) => tally[b] - tally[a])[0]
  return getTeam(topTeamId)
})

const confirmTeam = async () => {
  if (!isValidTeam.value) return
  closeSheet()
  modalOpen.value = true
  generatedPosterUrl.value = ''

  const count = selected.value.length
  if (count === 5) {
    posterConfig.value.itemPaddingY = 16
    posterConfig.value.cardHeight = 76
    posterConfig.value.rosterMarginTop = 60
  } else if (count === 6) {
    posterConfig.value.itemPaddingY = 12
    posterConfig.value.cardHeight = 64
    posterConfig.value.rosterMarginTop = 60
  } else { // 7
    posterConfig.value.itemPaddingY = 8
    posterConfig.value.cardHeight = 56
    posterConfig.value.rosterMarginTop = 60
  }

  // 自动触发海报生成
  savePoster()
}

const savePoster = async () => {
  if (!posterRef.value) return
  try {
    isGeneratingPoster.value = true
    await document.fonts.ready
    await nextTick()
    
    // Create an off-screen clone to bypass html2canvas transform scaling bugs
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.left = '-9999px'
    wrapper.style.top = '0'
    wrapper.style.width = '540px'
    wrapper.style.height = '960px'
    
    const clone = posterRef.value.cloneNode(true)
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const canvas = await html2canvas(clone, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: false,
      width: 540,
      height: 960,
      onclone: (clonedDoc) => {
        const link = clonedDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap'
        clonedDoc.head.appendChild(link)
      }
    })
    
    wrapper.remove()
    
    generatedPosterUrl.value = canvas.toDataURL('image/png')
    showToast('海报生成成功，请长按保存')
  } catch (e) {
    console.error('生成海报失败', e)
    showToast('生成海报失败，请重试')
  } finally {
    isGeneratingPoster.value = false
  }
}
const closeModal = () => { 
  modalOpen.value = false 
  generatedPosterUrl.value = ''
}

const getSelectedByRole = (role) => {
  return selected.value.filter(id => getPlayer(id)?.role === role)
}

// Mobile pips
const mobilePips = computed(() => {
  const pips = []
  displayGroups.value.forEach(g => {
    for(let i=0; i<g.quota; i++) {
      const isFilled = i < g.players.length
      const color = g.role === 'Flex' ? '#9ca3af' : roleColor(g.role)
      pips.push({ filled: isFilled, color })
    }
  })
  return pips
})

const roleIconUrl = (role) => {
  if (role === 'Flex') return getImageUrl('icons/star.png')
  return getImageUrl(`role/${role}.png`)
}

// Render function for TeamPanelBody (reused in desktop and mobile)
const TeamPanelBody = () => {
  const total = selected.value.length
  const pct = Math.round(total / 7 * 100)

  return h('div', null, [
    // Progress
    h('div', { class: 'team-progress' }, [
      h('div', { class: 'progress-row' }, [
        h('span', { class: 'progress-label' }, '阵容进度'),
        h('span', { class: 'progress-count' }, `${total}/7`)
      ]),
      h('div', { class: 'progress-bar-wrap' }, [
        h('div', { class: 'progress-bar', style: `width:${pct}%` })
      ])
    ]),
    // Slot groups
    ...displayGroups.value.map(g => {
        const isFlex = g.role === 'Flex'
        return h('div', { class: 'slot-group' }, [
          h('div', { class: 'slot-group-label' }, [
            isFlex ? h('img', { src: getImageUrl('icons/star.png'), style: 'width: 12px; height: 12px; filter: brightness(0) opacity(0.5); object-fit: contain; margin-right: 3px;' }) : null,
            !isFlex ? h('img', { src: getImageUrl('role/' + g.role + '.png'), style: `width: 12px; height: 12px; object-fit: contain; margin-right: 3px; filter: brightness(0) opacity(0.5);` }) : null,
            `${g.label} · ${g.players.length}/${g.quota}`
          ]),
        ...Array.from({ length: g.quota }).map((_, i) => {
          const pid = g.players[i]
          const p = pid ? getPlayer(pid) : null
          const t = p ? getTeam(p.teamId) : null
          return h('div', { class: ['slot', { filled: !!p }] }, [
            h('span', { class: 'slot-num' }, i + 1),
            h('span', { class: 'slot-empty-hint' }, '待选'),
            h('div', { class: 'slot-player' }, [
              h('div', { style: 'min-width:0;flex:1' }, [
                h('div', { class: 'slot-player-name' }, p ? p.name : ''),
                h('div', { class: 'slot-player-team' }, t ? t.name : '')
              ]),
              p ? h('button', {
                class: 'slot-remove',
                onClick: () => togglePlayer(p.id)
              }, '✕') : null
            ])
          ])
        })
      ])
    }),
    // Buttons
    h('button', {
      class: 'btn-primary',
      disabled: !isValidTeam.value,
      onClick: confirmTeam
    }, '✦ 确认梦之队'),
    h('button', {
      class: 'btn-secondary',
      onClick: clearAll
    }, '清空重选')
  ])
}
</script>

<style scoped>
.diy-page {
  --orange: #f97316;
  --black: #000;
  --white: #fff;
  --gray-50:  #fafafa;
  --gray-100: #f5f5f5;
  --gray-200: #e5e5e5;
  --gray-400: #9ca3af;
  --gray-600: #4b5563;
  --tank:    #3b82f6;
  --dps:     #ef4444;
  --support: #22c55e;
  --nav-h: 54px;
  --bar-h: 72px; /* mobile bottom bar */
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* Base resets handled by Tailwind */

/* TOP NAV */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; height: var(--nav-h);
  border-bottom: 2px solid var(--black);
  position: sticky; top: 0; background: var(--white); z-index: 200;
}
.nav-logo { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; }
.nav-logo span { color: var(--orange); }
.btn-back {
  display: flex; align-items: center; gap: 5px;
  font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 700; font-size: 0.6rem;
  text-transform: uppercase; letter-spacing: 0.08em;
  border: 2px solid var(--black); padding: 7px 12px;
  cursor: pointer; background: var(--white); color: var(--black);
  transition: background 0.15s, color 0.15s; white-space: nowrap;
}
.btn-back:hover, .btn-back:active { background: var(--black); color: var(--white); }

/* HERO */
.hero { padding: 24px 16px 16px; }
.hero h1 {
  font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900;
  font-size: clamp(1.8rem, 7vw, 3.6rem); text-transform: uppercase;
  line-height: 1; margin-bottom: 8px;
}
.hero h1 span { color: var(--orange); }
.hero p {
  color: var(--gray-600); font-size: 0.88rem; max-width: 600px;
  line-height: 1.5; font-weight: 500; font-family: 'Noto Sans SC', 'PingFang SC', sans-serif;
}
.hero p strong { color: var(--black); font-weight: 800; font-family: 'Noto Sans SC', 'PingFang SC', sans-serif; }

/* PAGE LAYOUT */
.page-wrap {
  display: grid; grid-template-columns: 1fr 360px; gap: 28px;
  max-width: 1280px; margin: 0 auto; padding: 0 20px 40px; align-items: start; width: 100%;
}

/* ROSTER PANEL */
.section-title {
  font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 800; font-size: 0.75rem;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-600);
  border-bottom: 2px solid var(--black); padding-bottom: 8px; margin-bottom: 14px;
}

/* Filter bar */
.filter-bar {
  display: flex; gap: 8px; margin-bottom: 18px; overflow-x: auto;
  -webkit-overflow-scrolling: touch; scrollbar-width: none; padding-bottom: 2px;
}
.filter-bar::-webkit-scrollbar { display: none; }
.filter-btn {
  font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 800; font-size: 0.65rem;
  text-transform: uppercase; letter-spacing: 0.05em;
  border: 2px solid var(--black); padding: 7px 14px; cursor: pointer;
  background: var(--white); display: flex; align-items: center; gap: 6px;
  white-space: nowrap; flex-shrink: 0; user-select: none;
  transition: background 0.15s, color 0.15s;
}
.filter-btn.active { background: var(--black); color: var(--white); }
.filter-btn:active:not(.active) { background: var(--gray-100); }
.filter-btn .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

/* Team groups */
.team-group { margin-bottom: 20px; }
.team-group-header {
  display: flex; align-items: center; gap: 8px; padding: 6px 0;
  border-bottom: 1px solid var(--gray-200); margin-bottom: 10px;
}
.team-group-header img { width: 24px; height: 24px; object-fit: contain; flex-shrink: 0; }
.team-name { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.04em; }
.team-region { margin-left: auto; font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.6rem; font-weight: 800; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.08em; flex-shrink: 0; }

/* Player cards */
.players-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
.player-card {
  border: 2px solid var(--gray-200); padding: 10px 11px; cursor: pointer;
  transition: border-color 0.12s, box-shadow 0.12s, background 0.12s, opacity 0.12s;
  position: relative; background: var(--white); user-select: none;
  -webkit-tap-highlight-color: transparent; min-height: 64px;
  display: flex; align-items: center;
}
@media (hover: hover) {
  .player-card:hover:not(.disabled):not(.selected) { border-color: var(--black); box-shadow: 3px 3px 0 var(--black); }
}
.player-card:active:not(.disabled):not(.selected) { background: var(--gray-100); }
.player-card.selected { border-color: var(--orange); background: #fff7ed; box-shadow: 3px 3px 0 var(--orange); }
.player-card.disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; }
.player-card.shake { animation: shake 0.3s ease; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.pc-name { display: flex; align-items: center; gap: 6px; font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.2; }
.pc-check { position: absolute; top: 5px; right: 7px; font-size: 0.9rem; color: var(--orange); display: none; }
.player-card.selected .pc-check { display: block; }

/* TEAM PANEL (desktop) */
.team-panel-desktop { position: sticky; top: 16px; align-self: start; }
.team-panel-box { border: 3px solid var(--black); background: var(--white); }
.team-panel-header {
  background: var(--black); color: var(--white); padding: 14px 18px;
  font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.85rem;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.team-panel-body { padding: 16px; }

/* Slots (Reused logic, we will style them with :deep since they are created via h()) */
:deep(.slot-group) { margin-bottom: 16px; }
:deep(.slot-group-label) {
  font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 800; font-size: 0.6rem;
  text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-400);
  margin-bottom: 7px; display: flex; align-items: center; gap: 5px;
}
:deep(.slot-group-label .role-dot) { width: 7px; height: 7px; border-radius: 50%; }
:deep(.slot) {
  border: 2px dashed var(--gray-200); padding: 10px 12px; min-height: 54px;
  display: flex; align-items: center; gap: 8px; margin-bottom: 7px;
  transition: border-color 0.15s; position: relative;
}
:deep(.slot.filled) { border-style: solid; border-color: var(--black); }
:deep(.slot .slot-num) { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 1.1rem; color: var(--gray-200); min-width: 20px; }
:deep(.slot.filled .slot-num) { display: none; }
:deep(.slot-empty-hint) { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.62rem; font-weight: 700; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; }
:deep(.slot-player) { display: none; flex: 1; align-items: center; gap: 8px; min-width: 0; }
:deep(.slot.filled .slot-player) { display: flex; }
:deep(.slot.filled .slot-empty-hint) { display: none; }
:deep(.slot-player-name) { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.8rem; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
:deep(.slot-player-team) { font-family: 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.65rem; color: var(--gray-600); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
:deep(.slot-remove) { margin-left: auto; background: none; border: none; cursor: pointer; font-size: 0.9rem; color: var(--gray-400); padding: 4px 8px; line-height: 1; transition: color 0.1s; flex-shrink: 0; touch-action: manipulation; }
:deep(.slot-remove:hover), :deep(.slot-remove:active) { color: #ef4444; }

/* Progress */
:deep(.team-progress) { margin-bottom: 16px; padding-bottom: 14px; border-bottom: 1px solid var(--gray-200); }
:deep(.progress-row) { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
:deep(.progress-label) { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-600); }
:deep(.progress-count) { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.75rem; font-weight: 900; }
:deep(.progress-bar-wrap) { height: 5px; background: var(--gray-200); }
:deep(.progress-bar) { height: 100%; background: var(--orange); transition: width 0.3s ease; }

/* Buttons */
:deep(.btn-primary) {
  width: 100%; padding: 13px; background: var(--orange); border: 2px solid var(--orange);
  color: var(--white); font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900;
  font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em;
  cursor: pointer; transition: background 0.15s, border-color 0.15s; margin-bottom: 8px; touch-action: manipulation;
}
:deep(.btn-primary:active:not(:disabled)), :deep(.btn-primary:hover:not(:disabled)) { background: #ea6c06; border-color: #ea6c06; }
:deep(.btn-primary:disabled) { opacity: 0.38; cursor: not-allowed; }
:deep(.btn-secondary) {
  width: 100%; padding: 10px; background: var(--white); border: 2px solid var(--black);
  color: var(--black); font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 800;
  font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em;
  cursor: pointer; transition: background 0.15s, color 0.15s; touch-action: manipulation;
}
:deep(.btn-secondary:active), :deep(.btn-secondary:hover) { background: var(--black); color: var(--white); }

/* MOBILE BOTTOM BAR */
.mobile-bottom-bar { display: none; }

/* BOTTOM SHEET */
.sheet-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 400; }
.sheet-overlay.open { display: block; }
.bottom-sheet {
  position: fixed; left: 0; right: 0; bottom: 0; background: var(--white);
  border-top: 3px solid var(--black); z-index: 500; transform: translateY(100%);
  transition: transform 0.32s cubic-bezier(.32,1,.65,1); max-height: 88vh;
  display: flex; flex-direction: column; border-radius: 0;
}
.bottom-sheet.open { transform: translateY(0); }
.sheet-handle-bar { display: flex; justify-content: center; padding: 10px 0 6px; flex-shrink: 0; }
.sheet-handle { width: 40px; height: 4px; border-radius: 2px; background: var(--gray-200); }
.sheet-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px 12px; flex-shrink: 0; border-bottom: 2px solid var(--black);
}
.sheet-title { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; }
.sheet-close { background: none; border: none; font-size: 1.3rem; cursor: pointer; color: var(--gray-600); padding: 4px 8px; line-height: 1; touch-action: manipulation; }
.sheet-body { overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 16px; flex: 1; }

/* RESULT MODAL */
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 600; align-items: flex-end; justify-content: center; padding: 0; }
.modal-overlay.show { display: flex; }
.modal { background: var(--white); border-top: 3px solid var(--black); width: 100%; max-width: 100%; max-height: 92vh; overflow-y: auto; -webkit-overflow-scrolling: touch; animation: modalSlideUp 0.28s cubic-bezier(.32,1,.65,1); }
@keyframes modalSlideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.modal-header { background: var(--black); color: var(--white); padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 1; }
.modal-header h2 { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.08em; }
.modal-close { background: none; border: none; color: var(--white); font-size: 1.4rem; cursor: pointer; padding: 2px 8px; line-height: 1; touch-action: manipulation; }
.modal-body { padding: 24px 20px; }
.modal-team-name { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: clamp(1.5rem, 6vw, 2.2rem); text-transform: uppercase; line-height: 1; margin-bottom: 5px; }
.modal-subtitle { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.65rem; font-weight: 800; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }
.modal-roster { display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
.modal-player { display: flex; align-items: center; gap: 12px; border: 2px solid var(--black); padding: 12px 14px; }
.modal-player-info { flex: 1; min-width: 0; }
.modal-player-name { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.95rem; text-transform: uppercase; }
.modal-player-team { font-size: 0.75rem; color: var(--gray-600); font-weight: 600; }

/* TOAST */
.toast {
  position: fixed; bottom: calc(var(--bar-h) + 12px); left: 50%; transform: translateX(-50%);
  background: #1f2937; color: var(--white); font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif;
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
  padding: 11px 22px; z-index: 700; border-left: 4px solid var(--orange);
  white-space: nowrap; opacity: 0; transition: opacity 0.2s; pointer-events: none;
}
.toast.show { opacity: 1; }

.dot-tank     { background: var(--tank); }
.dot-dps      { background: var(--dps); }
.dot-support  { background: var(--support); }

/* RESPONSIVE — MOBILE ≤ 768px */
@media (max-width: 768px) {
  .diy-page { padding-bottom: var(--bar-h); }
  .hero { padding: 20px 16px 14px; }
  .hero h1 { font-size: clamp(1.6rem, 8vw, 2.6rem); }
  .hero p  { font-size: 0.78rem; }

  .page-wrap { grid-template-columns: 1fr; padding: 0 14px 20px; gap: 0; }
  .team-panel-desktop { display: none; }

  .players-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
  .player-card { padding: 9px 10px; min-height: 58px; }
  .pc-name { font-size: 0.72rem; }

  .mobile-bottom-bar {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: var(--bar-h);
    background: var(--white); border-top: 2px solid var(--black); z-index: 300;
    align-items: center; padding: 0 14px; gap: 12px;
  }
  .mbb-progress { flex: 1; display: flex; flex-direction: column; gap: 5px; }
  .mbb-progress-row { display: flex; justify-content: space-between; align-items: baseline; }
  .mbb-label { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.58rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-600); }
  .mbb-count { font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-size: 0.8rem; font-weight: 900; }
  .mbb-bar-wrap { height: 5px; background: var(--gray-200); border-radius: 99px; overflow: hidden; }
  .mbb-bar { height: 100%; background: var(--orange); transition: width 0.3s ease; border-radius: 99px; }
  .mbb-pips { display: flex; gap: 4px; align-items: center; }
  .mbb-pip { width: 7px; height: 7px; border-radius: 50%; border: 1.5px solid var(--gray-200); transition: background 0.15s, border-color 0.15s; }
  .mbb-pip.filled { border-color: transparent; }
  .mbb-btn { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--black); color: var(--white); border: none; cursor: pointer; height: 48px; min-width: 80px; font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; touch-action: manipulation; gap: 4px; transition: background 0.15s; border-radius: 8px; }
  .mbb-btn:active { background: #333; }
  .mbb-btn-icon { width: 14px; height: 14px; }
  .mbb-confirm { flex-shrink: 0; height: 48px; min-width: 80px; background: var(--orange); border: none; color: var(--white); font-family: 'Orbitron', 'Noto Sans SC', 'PingFang SC', sans-serif; font-weight: 900; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; touch-action: manipulation; transition: background 0.15s; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; border-radius: 8px; }
  .mbb-confirm:active:not(:disabled) { background: #ea6c06; }
  .mbb-confirm:disabled { opacity: 0.4; cursor: not-allowed; }
  .mbb-confirm-icon { width: 15px; height: 15px; }

  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal { border-radius: 0; max-height: 88vh; }
  .toast { bottom: calc(var(--bar-h) + 10px); }
}

/* RESPONSIVE — TABLET 769-1040px */
@media (min-width: 769px) and (max-width: 1040px) {
  .page-wrap { grid-template-columns: 1fr 300px; gap: 20px; }
}
@media (min-width: 769px) {
  .modal-overlay { align-items: center; padding: 20px; }
  .modal { border-radius: 0; max-width: 560px; border: 3px solid var(--black); border-top: 3px solid var(--black); }
  .toast { bottom: 28px; }
}
</style>
