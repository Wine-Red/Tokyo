<template>
  <div class="prediction-page text-black bg-white h-screen w-full overflow-hidden font-inter relative flex flex-col">
    <!-- TOP NAV -->
    <nav class="nav">
      <div class="nav-logo">OWCS <span>Tokyo</span> 2026</div>
      <button @click="$emit('back')" class="btn-back">← 返回赛事页</button>
    </nav>

    <!-- HERO -->
    <header class="hero">
      <h1>冠军<span>之路</span></h1>
      <p>预测 2026 OWCS 东京全球冠军赛的最终胜者。<br>
         点击队伍以推进赛程，完成全部 14 场预测后可生成你的专属赛程。</p>
    </header>

    <!-- MAIN BRACKET AREA -->
    <div class="bracket-container-wrapper flex-1 overflow-auto relative bg-[#fafafa]">
      <div class="bracket-container" :style="{ width: '1320px', height: '660px', position: 'relative', margin: '0 auto' }">
        
        <!-- SVG Connections -->
        <svg class="bracket-lines" width="1320" height="660" style="position:absolute; top:0; left:0; pointer-events:none; z-index:0;">
          <path v-for="(line, i) in lines" :key="i" :d="line.path" fill="none" 
                :stroke="line.isLoser ? '#d1d5db' : '#9ca3af'" 
                :stroke-width="line.isLoser ? 2 : 3" 
                :stroke-dasharray="line.isLoser ? '5 5' : 'none'"
                stroke-linecap="round" stroke-linejoin="round" />
        </svg>

        <!-- Match Boxes -->
        <div v-for="m in matches" :key="m.id" 
             class="match-box shadow-sm"
             :class="{ 'is-final': m.id === 'm14' }"
             :style="{ left: m.x + 'px', top: m.y + 'px' }">
          <div class="match-title">{{ m.title }}</div>
          <div class="match-teams">
            <!-- Team 1 -->
            <div class="team-row" 
                 :class="{ 
                   'is-winner': m.winner === m.t1 && m.t1,
                   'is-loser': m.winner && m.winner !== m.t1 && m.t1,
                   'is-empty': !m.t1,
                   'clickable': m.t1 && m.t2 && !m.winner
                 }"
                 @click="setWinner(m.id, m.t1)">
              <div v-if="m.t1" :style="{ backgroundImage: 'url(' + getTeamLogo(m.t1) + ')' }" class="team-logo"></div>
              <div v-else class="team-logo-empty"></div>
              <span class="team-name">{{ getTeamName(m.t1) }}</span>
              <span class="check-icon" v-if="m.winner === m.t1 && m.t1">✔</span>
            </div>
            <!-- Divider -->
            <div class="team-divider"></div>
            <!-- Team 2 -->
            <div class="team-row" 
                 :class="{ 
                   'is-winner': m.winner === m.t2 && m.t2,
                   'is-loser': m.winner && m.winner !== m.t2 && m.t2,
                   'is-empty': !m.t2,
                   'clickable': m.t1 && m.t2 && !m.winner
                 }"
                 @click="setWinner(m.id, m.t2)">
              <div v-if="m.t2" :style="{ backgroundImage: 'url(' + getTeamLogo(m.t2) + ')' }" class="team-logo"></div>
              <div v-else class="team-logo-empty"></div>
              <span class="team-name">{{ getTeamName(m.t2) }}</span>
              <span class="check-icon" v-if="m.winner === m.t2 && m.t2">✔</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MOBILE BOTTOM BAR -->
    <div class="mobile-bottom-bar">
      <div class="mbb-progress">
        <div class="mbb-progress-row">
          <span class="mbb-label">预测进度</span>
          <span class="mbb-count">{{ completedCount }}/14</span>
        </div>
        <div class="mbb-bar-wrap">
          <div class="mbb-bar" :style="`width:${Math.round(completedCount/14*100)}%`"></div>
        </div>
      </div>
      <button class="mbb-btn" @click="resetBracket">
        重置
      </button>
      <button class="mbb-confirm" :disabled="completedCount < 14" @click="generatePoster">
        生成赛程图
      </button>
    </div>

    <!-- POSTER MODAL -->
    <div class="modal-overlay" :class="{ show: modalOpen }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>✦ 预测赛程图</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <template v-if="!generatedPosterUrl">
            <div style="text-align: center; font-size: 0.95rem; color: #ea6c06; font-weight: 900; margin-bottom: 20px;">
              正在为您生成赛程图...
            </div>
          </template>
          <template v-else>
            <div style="text-align: center; font-size: 0.95rem; color: #ea6c06; font-weight: 900; margin-bottom: 12px;">
              长按下方图片保存至手机相册
            </div>
            <div style="display: flex; justify-content: center; background: #e5e7eb; border-radius: 8px; padding: 10px; overflow: hidden; margin-bottom: 20px;">
              <img :src="generatedPosterUrl" style="max-width: 100%; height: auto; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />
            </div>
            <div style="display:flex; gap:12px;">
              <button class="btn-primary" style="flex:1;" @click="closeModal">← 返回修改</button>
            </div>
          </template>

          <!-- Hidden Container for html2canvas (Full Poster Export) -->
          <div style="position: absolute; left: -9999px; top: 0; pointer-events: none; opacity: 0; overflow: hidden;">
            <div ref="posterRef" style="width: 1672px; height: 941px; position:relative; box-sizing:border-box; overflow:hidden; background:#fff;">
              <!-- Background Image -->
              <img :src="predictBg" style="position:absolute; top:0; left:0; width:1672px; height:941px; object-fit:cover; z-index:0;" />
              
              <!-- 冠军之路 Text -->
              <div style="position:absolute; top:60px; left:60px; font-family:'Orbitron', 'Noto Sans SC', sans-serif; font-size:70px; font-weight:900; z-index:10; display:flex; letter-spacing:4px;">
                <span style="color:#000;">冠军</span>
                <span style="color:#f97316;">之路</span>
              </div>

              <!-- Champion Display -->
              <div style="position:absolute; top:375px; left:60px; width:300px; height:50px; z-index:10; display:flex; align-items:center; justify-content:center;">
                <div v-if="championTeam" style="width:50px; height:50px; margin-right:12px; flex-shrink:0; transform: translateY(2px); display:flex; align-items:center; justify-content:center;">
                  <img :src="getImageUrl(championTeam.logo)" style="max-width:100%; max-height:100%; width:auto; height:auto; display:block;" />
                </div>
                <div v-else style="width:50px; height:50px; background:#f3f4f6; border-radius:50%; margin-right:12px; flex-shrink:0; display:flex; align-items:center; justify-content:center; color:#9ca3af; font-size:24px; font-weight:bold;">?</div>
                <div style="font-family:'Orbitron', sans-serif; font-size:20px; font-weight:900; color:#000; white-space:nowrap; transform: translateY(-4px);">
                  {{ championTeam ? championTeam.name : 'TBD' }}
                </div>
              </div>

              <!-- QR Code & Slogan -->
              <div style="position:absolute; top:500px; left:40px; display:flex; align-items:flex-end; z-index:10;">
                <img :src="godlikeLogo" style="width:220px; height:220px;" />
                <div style="display:flex; gap:16px; margin-left:24px; margin-bottom:12px; font-family:'Noto Sans SC', sans-serif;">
                  <div style="writing-mode:vertical-rl; text-orientation:upright; font-size:22px; font-weight:900; color:#000; letter-spacing:6px; line-height:1; transform: translateY(14px);">
                    定制你的冠军之路
                  </div>
                  <div style="writing-mode:vertical-rl; text-orientation:upright; font-size:32px; font-weight:900; color:#f97316; letter-spacing:6px; line-height:1; transform:translateY(8px);">
                    上大神
                  </div>
                </div>
              </div>

              <!-- Scaled Bracket Container -->
              <div style="position:absolute; top:75px; left:440px; width:1320px; height:660px; transform: scale(1.1); transform-origin: top left; z-index:5;">
                <svg width="1320" height="660" style="position:absolute; top:0; left:0; z-index:0;">
                  <path v-for="(line, i) in lines" :key="i" :d="line.path" fill="none" stroke="#9ca3af" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <div v-for="m in matches" :key="'p_'+m.id" 
                   style="position:absolute; width:175px; height:72px; background:#fff; border:2px solid #000; border-radius:6px; z-index:10; display:block; overflow:hidden; box-sizing:border-box;"
                     :style="{ left: m.x + 'px', top: m.y + 'px', borderColor: m.id === 'm14' ? '#f97316' : '#000', borderWidth: m.id === 'm14' ? '3px' : '2px' }">
                  <div style="background:#000; color:#fff; font-size:10px; line-height:10px; height:20px; font-weight:800; text-align:center; padding-top:0px; padding-bottom:10px; font-family:'Orbitron', 'Noto Sans SC', sans-serif; box-sizing:border-box;"
                       :style="{ background: m.id === 'm14' ? '#f97316' : '#000' }">{{ m.title }}</div>
                  <div style="height:48px; position:relative; background:#fff; box-sizing:border-box;">
                    <!-- T1 -->
                    <div style="position:absolute; left:0; top:0; width:100%; height:23px; box-sizing:border-box;"
                         :style="{ opacity: (m.winner && m.winner !== m.t1 && m.t1) ? '0.4' : '1', background: (m.winner === m.t1 && m.t1) ? '#fff7ed' : '#fff' }">
                      <div v-if="m.t1" style="position:absolute; left:8px; top:3.5px; width:16px; height:16px; display:flex; align-items:center; justify-content:center;">
                        <img :src="getTeamLogo(m.t1)" style="max-width:100%; max-height:100%; width:auto; height:auto; display:block;" />
                      </div>
                      <div v-else style="position:absolute; left:8px; top:3.5px; width:16px; height:16px;"></div>
                      <span style="position:absolute; left:30px; right:8px; top:-2px; padding-bottom:8px; line-height:14px; font-family:'Orbitron', sans-serif; font-size:12px; font-weight:800; color:#000; white-space:nowrap; display:block; box-sizing:border-box;">{{ getTeamName(m.t1) }}</span>
                    </div>
                    <!-- Divider -->
                    <div style="position:absolute; left:0; top:23px; width:100%; height:2px; background:#e5e7eb;"></div>
                    <!-- T2 -->
                    <div style="position:absolute; left:0; top:25px; width:100%; height:23px; box-sizing:border-box;"
                         :style="{ opacity: (m.winner && m.winner !== m.t2 && m.t2) ? '0.4' : '1', background: (m.winner === m.t2 && m.t2) ? '#fff7ed' : '#fff' }">
                      <div v-if="m.t2" style="position:absolute; left:8px; top:3.5px; width:16px; height:16px; display:flex; align-items:center; justify-content:center;">
                        <img :src="getTeamLogo(m.t2)" style="max-width:100%; max-height:100%; width:auto; height:auto; display:block;" />
                      </div>
                      <div v-else style="position:absolute; left:8px; top:3.5px; width:16px; height:16px;"></div>
                      <span style="position:absolute; left:30px; right:8px; top:-2px; padding-bottom:8px; line-height:14px; font-family:'Orbitron', sans-serif; font-size:12px; font-weight:800; color:#000; white-space:nowrap; display:block; box-sizing:border-box;">{{ getTeamName(m.t2) }}</span>
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
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import html2canvas from 'html2canvas'
import { getImageUrl } from '../utils/image'
import predictBg from '../assets/others/predict.png'
import godlikeLogo from '../assets/icons/godlike.png'
import mockData from '../data/mockData.json'

defineEmits(['back'])

const TEAMS = mockData.teams

// 8 Teams Initial Setup
const initialTeams = [
  TEAMS[0].id, TEAMS[7].id, // M1: 1 vs 8
  TEAMS[3].id, TEAMS[4].id, // M2: 4 vs 5
  TEAMS[1].id, TEAMS[6].id, // M3: 2 vs 7
  TEAMS[2].id, TEAMS[5].id  // M4: 3 vs 6
]

// Matches Definition with Coordinates
const baseMatches = {
  m1: { id: 'm1', title: '胜者组 R1', t1: initialTeams[0], t2: initialTeams[1], winner: null, next: { id: 'm7', pos: 't1' }, nextLoser: { id: 'm6', pos: 't2' }, x: 20, y: 40 },
  m2: { id: 'm2', title: '胜者组 R1', t1: initialTeams[2], t2: initialTeams[3], winner: null, next: { id: 'm7', pos: 't2' }, nextLoser: { id: 'm6', pos: 't1' }, x: 20, y: 130 },
  m3: { id: 'm3', title: '胜者组 R1', t1: initialTeams[4], t2: initialTeams[5], winner: null, next: { id: 'm8', pos: 't1' }, nextLoser: { id: 'm5', pos: 't1' }, x: 20, y: 240 },
  m4: { id: 'm4', title: '胜者组 R1', t1: initialTeams[6], t2: initialTeams[7], winner: null, next: { id: 'm8', pos: 't2' }, nextLoser: { id: 'm5', pos: 't2' }, x: 20, y: 330 },

  m7: { id: 'm7', title: '胜者组 半决赛', t1: null, t2: null, winner: null, next: { id: 'm12', pos: 't1' }, nextLoser: { id: 'm10', pos: 't1' }, x: 240, y: 85 },
  m8: { id: 'm8', title: '胜者组 半决赛', t1: null, t2: null, winner: null, next: { id: 'm12', pos: 't2' }, nextLoser: { id: 'm9', pos: 't1' }, x: 240, y: 285 },

  m12: { id: 'm12', title: '胜者组 决赛', t1: null, t2: null, winner: null, next: { id: 'm14', pos: 't1' }, nextLoser: { id: 'm13', pos: 't1' }, x: 460, y: 185 },

  m5: { id: 'm5', title: '败者组 R1', t1: null, t2: null, winner: null, next: { id: 'm9', pos: 't2' }, x: 20, y: 440 },
  m6: { id: 'm6', title: '败者组 R1', t1: null, t2: null, winner: null, next: { id: 'm10', pos: 't2' }, x: 20, y: 530 },

  m9: { id: 'm9', title: '败者组 R2', t1: null, t2: null, winner: null, next: { id: 'm11', pos: 't1' }, x: 240, y: 440 },
  m10: { id: 'm10', title: '败者组 R2', t1: null, t2: null, winner: null, next: { id: 'm11', pos: 't2' }, x: 240, y: 530 },

  m11: { id: 'm11', title: '败者组 半决赛', t1: null, t2: null, winner: null, next: { id: 'm13', pos: 't2' }, x: 460, y: 485 },

  m13: { id: 'm13', title: '败者组 决赛', t1: null, t2: null, winner: null, next: { id: 'm14', pos: 't2' }, x: 680, y: 485 },

  m14: { id: 'm14', title: '总决赛', t1: null, t2: null, winner: null, next: null, x: 900, y: 335 }
}

const matches = ref(JSON.parse(JSON.stringify(baseMatches)))

// Compute SVG connection lines
const lines = computed(() => {
  const result = []
  const bw = 175 // box width
  const bh = 72  // box height
  const drawLine = (m1, m2, isLoser = false) => {
    if (!m1 || !m2) return
    const x1 = m1.x + bw
    const y1 = m1.y + bh / 2
    const x2 = m2.x
    const y2 = m2.y + bh / 2
    
    if (isLoser) {
      // Do not draw loser connections as requested
      return
    } else {
      let midX = (x1 + x2) / 2
      if (m1.id === 'm12') {
        midX = x1 + 220 
      }
      if (m1.id === 'm13') {
        midX = x1 + 30 
      }
      result.push({ path: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`, isLoser: false })
    }
  }

  Object.values(matches.value).forEach(m => {
    if (m.next) {
      drawLine(m, matches.value[m.next.id])
    }
    if (m.nextLoser) {
      drawLine(m, matches.value[m.nextLoser.id], true)
    }
  })
  return result
})

const completedCount = computed(() => {
  return Object.values(matches.value).filter(m => m.winner !== null).length
})

const championTeam = computed(() => {
  const finalWinnerId = matches.value['m14'].winner
  return finalWinnerId ? TEAMS.find(t => t.id === finalWinnerId) : null
})

const getTeamName = (id) => {
  if (!id) return 'TBD'
  return TEAMS.find(t => t.id === id)?.name || id
}

const getTeamLogo = (id) => {
  if (!id) return ''
  const t = TEAMS.find(t => t.id === id)
  return t ? getImageUrl(t.logo) : ''
}

const simulateBracket = () => {
  // Reset all non-R1 teams
  const r1Ids = ['m1', 'm2', 'm3', 'm4']
  Object.values(matches.value).forEach(m => {
    if (!r1Ids.includes(m.id)) {
      m.t1 = null
      m.t2 = null
    }
  })

  let changed = true
  while (changed) {
    changed = false
    Object.values(matches.value).forEach(m => {
      // Clear invalid winner
      if (m.winner && m.winner !== m.t1 && m.winner !== m.t2) {
        m.winner = null
        changed = true
      }
      
      // Propagate winner and loser
      if (m.t1 && m.t2 && m.winner) {
        const loserId = m.t1 === m.winner ? m.t2 : m.t1
        
        if (m.next) {
          const nextM = matches.value[m.next.id]
          if (nextM[m.next.pos] !== m.winner) {
            nextM[m.next.pos] = m.winner
            changed = true
          }
        }
        if (m.nextLoser) {
          const nextLoserM = matches.value[m.nextLoser.id]
          if (nextLoserM[m.nextLoser.pos] !== loserId) {
            nextLoserM[m.nextLoser.pos] = loserId
            changed = true
          }
        }
      }
    })
  }
}

const setWinner = (matchId, teamId) => {
  const match = matches.value[matchId]
  if (!match || !match.t1 || !match.t2) return
  if (match.t1 !== teamId && match.t2 !== teamId) return
  
  match.winner = teamId
  simulateBracket()
}

const resetBracket = () => {
  matches.value = JSON.parse(JSON.stringify(baseMatches))
}

// Modal & Poster
const modalOpen = ref(false)
const posterRef = ref(null)
const generatedPosterUrl = ref('')

const closeModal = () => {
  modalOpen.value = false
}

const generatePoster = async () => {
  if (completedCount.value < 14) return
  modalOpen.value = true
  generatedPosterUrl.value = ''
  
  try {
    await document.fonts.ready
    await nextTick()
    
    // Off-screen clone to prevent transform issues
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.left = '-9999px'
    wrapper.style.top = '0'
    wrapper.style.width = '1672px'
    wrapper.style.height = '941px'
    
    const clone = posterRef.value.cloneNode(true)
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)
    
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const canvas = await html2canvas(clone, {
      backgroundColor: null, // Keep transparent background
      scale: 2, // High resolution (retina display quality)
      useCORS: true,
      allowTaint: false,
      width: 1672,
      height: 941,
      onclone: (clonedDoc) => {
        const link = clonedDoc.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&display=swap'
        clonedDoc.head.appendChild(link)
      }
    })
    
    wrapper.remove()
    generatedPosterUrl.value = canvas.toDataURL('image/png')
  } catch (e) {
    console.error('赛程图生成失败', e)
  }
}
</script>

<style scoped>
.prediction-page {
  --orange: #f97316;
  --black: #000;
  --white: #fff;
  --gray-200: #e5e7eb;
  --gray-400: #9ca3af;
  --nav-h: 54px;
  --bar-h: 72px;
}

.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; height: var(--nav-h);
  border-bottom: 2px solid var(--black);
  background: var(--white); z-index: 200;
}
.nav-logo { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; }
.nav-logo span { color: var(--orange); }
.btn-back {
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-weight: 700; font-size: 0.6rem;
  border: 2px solid var(--black); padding: 7px 12px;
  background: var(--white); color: var(--black); transition: 0.15s;
}
.btn-back:hover { background: var(--black); color: var(--white); }

.hero { padding: 24px 16px 16px; }
.hero h1 { font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-weight: 900; font-size: clamp(1.8rem, 7vw, 3.6rem); line-height: 1; margin-bottom: 8px; text-transform: uppercase; }
.hero h1 span { color: var(--orange); }
.hero p { color: #4b5563; font-size: 0.88rem; font-weight: 500; font-family: 'Noto Sans SC', sans-serif; line-height: 1.5; }

.bracket-container-wrapper {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}
.bracket-container {
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
}

.match-box {
  position: absolute;
  width: 175px;
  height: 72px;
  background: var(--white);
  border: 2px solid var(--black);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 10;
  transition: transform 0.15s, box-shadow 0.15s;
}
.match-box:hover {
  transform: translateY(-2px);
  box-shadow: 4px 4px 0 rgba(0,0,0,0.1);
}
.match-box.is-final {
  border-color: var(--orange);
  border-width: 2px;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.3);
}

.match-title {
  background: var(--black);
  color: var(--white);
  font-size: 10px;
  height: 20px;
  line-height: 20px;
  font-weight: 800;
  text-align: center;
  font-family: 'Orbitron', 'Noto Sans SC', sans-serif;
  box-sizing: border-box;
}
.match-box.is-final .match-title {
  background: var(--orange);
}

.match-teams {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.team-row {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 8px;
  gap: 6px;
  background: var(--white);
  transition: background 0.15s;
}
.team-row.clickable {
  cursor: pointer;
}
.team-row.clickable:hover {
  background: #f3f4f6;
}
.team-row.is-winner {
  background: #fff7ed;
}
.team-row.is-loser {
  opacity: 0.4;
  background: #f9fafb;
}
.team-row.is-empty {
  color: var(--gray-400);
}
.team-logo {
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
.team-logo-empty {
  width: 16px;
  height: 16px;
  background: #f3f4f6;
  border-radius: 2px;
}
.team-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 12px;
  font-weight: 800;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.check-icon {
  font-size: 12px;
  color: var(--orange);
}
.team-divider {
  height: 1px;
  background: var(--gray-200);
  width: 100%;
}

/* Mobile Bottom Bar */
.mobile-bottom-bar {
  display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: var(--bar-h);
  background: var(--white); border-top: 2px solid var(--black); z-index: 300;
  align-items: center; padding: 0 16px; gap: 12px;
}
.mbb-progress { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.mbb-progress-row { display: flex; justify-content: space-between; align-items: baseline; }
.mbb-label { font-family: 'Orbitron', 'Noto Sans SC', sans-serif; font-size: 0.65rem; font-weight: 800; color: #4b5563; }
.mbb-count { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: 900; }
.mbb-bar-wrap { height: 6px; background: var(--gray-200); border-radius: 99px; }
.mbb-bar { height: 100%; background: var(--orange); border-radius: 99px; transition: width 0.3s; }
.mbb-btn { height: 44px; padding: 0 16px; background: var(--white); border: 2px solid var(--black); font-weight: 800; font-size: 0.75rem; cursor: pointer; border-radius: 6px; }
.mbb-confirm { height: 44px; padding: 0 20px; background: var(--orange); border: none; color: var(--white); font-weight: 800; font-size: 0.75rem; cursor: pointer; border-radius: 6px; }
.mbb-confirm:disabled { opacity: 0.4; }

/* Modal */
.modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 600; align-items: center; justify-content: center; padding: 20px; }
.modal-overlay.show { display: flex; }
.modal { background: var(--white); border: 3px solid var(--black); width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.modal-header { background: var(--black); color: var(--white); padding: 16px; display: flex; justify-content: space-between; }
.modal-header h2 { font-weight: 900; font-size: 1rem; }
.modal-close { background: none; border: none; color: var(--white); font-size: 1.2rem; cursor: pointer; }
.modal-body { padding: 20px; }
.btn-primary { width: 100%; padding: 12px; background: var(--orange); border: none; color: var(--white); font-weight: 900; font-size: 0.8rem; cursor: pointer; }

@media (max-width: 768px) {
  .prediction-page { padding-bottom: var(--bar-h); }
  .bracket-container-wrapper { padding: 10px; }
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal { max-height: 85vh; border: none; border-top: 3px solid var(--black); }
}
</style>
