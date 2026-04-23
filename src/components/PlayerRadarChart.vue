<template>
  <div ref="chartRef" class="w-full h-full min-h-[300px]"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core'
import { RadarChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([RadarChart, TooltipComponent, CanvasRenderer])

const props = defineProps({
  player: {
    type: Object,
    required: true
  },
  allPlayers: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const getIndicatorsByRole = (role, stats, allPlayers) => {
    // 获取该位置所有选手的数据以计算最大值和最小值
    const rolePlayers = allPlayers.filter(p => p.role === role)
    const maxValues = [0, 0, 0, 0, 0]
    const minValues = [Infinity, Infinity, Infinity, Infinity, Infinity]
    
    rolePlayers.forEach(p => {
      const pStats = getStatsByRole(role, p.stats)
      pStats.forEach((val, idx) => {
        // 给最大值留出10%的余量，确保不会完全顶边
        maxValues[idx] = Math.max(maxValues[idx], val * 1.1)
        // 记录真实的最小值（主要用于生存的死亡数）
        minValues[idx] = Math.min(minValues[idx], val)
      })
    })

    // 如果数据不足，提供默认最大值和最小值
    const defaultMax = [30, 10, 10, 15000, 15000]
    const finalMax = maxValues.map((v, i) => v > 0 ? v : defaultMax[i])
    
    // 生存轴（死亡数）反转特殊处理：
    // ECharts 雷达图在有些版本对 min > max 支持不够好，
    // 因此我们使用最高死亡数减去当前死亡数（差值法）来渲染，外层再用 formatter 映射真实数值。
    const baseIndicators = {
        'Tank': [
          { name: '消灭', max: finalMax[0], index: 0 },
          { name: 'K/D', max: finalMax[1], index: 1 },
          { name: '生存', max: finalMax[2], index: 2 }, // 恢复成正常 max（比如10），内部通过数据差值翻转
          { name: '抵挡', max: finalMax[3], index: 3 },
          { name: '伤害', max: finalMax[4], index: 4 }
        ],
        'DPS': [
          { name: '消灭', max: finalMax[0], index: 0 },
          { name: 'K/D', max: finalMax[1], index: 1 },
          { name: '生存', max: finalMax[2], index: 2 },
          { name: '助攻', max: finalMax[3], index: 3 },
          { name: '伤害', max: finalMax[4], index: 4 }
        ],
        'Support': [
          { name: '消灭', max: finalMax[0], index: 0 },
          { name: 'KA/D', max: finalMax[1], index: 1 },
          { name: '生存', max: finalMax[2], index: 2 },
          { name: '助攻', max: finalMax[3], index: 3 },
          { name: '治疗', max: finalMax[4], index: 4 }
        ]
      }
      
      const indicators = baseIndicators[role] || baseIndicators['DPS']
      
      return indicators.map(ind => ({
        name: `{title|${ind.name}}\n{value|${stats[ind.index]}}`,
        max: ind.max
      }))
    }

  const getStatsByRole = (role, fullStats) => {
    const baseIndicators = {
      'Tank': [0, 1, 2, 3, 4],
      'DPS': [0, 1, 2, 3, 4],
      'Support': [0, 1, 2, 3, 4]
    }
    const indices = baseIndicators[role] || baseIndicators['DPS']
    return indices.map(idx => fullStats[idx])
  }

  const getRenderStats = (role, stats, allPlayers) => {
    const renderStats = [...stats]
    // 找出该位置的最大可能死亡数
    const rolePlayers = allPlayers.filter(p => p.role === role)
    let maxSurvival = 0
    rolePlayers.forEach(p => {
      const pStats = getStatsByRole(role, p.stats)
      maxSurvival = Math.max(maxSurvival, pStats[2]) // index 2 总是“生存”
    })
    maxSurvival = maxSurvival * 1.1 || 10 // 加 10% 缓冲，如果为 0 给个默认值
    
    // 我们用 最大可能死亡数 - 实际死亡数 来作为渲染值。
    // 如果实际死亡是 3.1，最大死亡是 10，那么渲染值就是 10 - 3.1 = 6.9（非常靠外）
    renderStats[2] = Math.max(0, maxSurvival - renderStats[2])
    return renderStats
  }

  const getAverageStats = (role) => {
    if (!props.allPlayers || props.allPlayers.length === 0) {
      return [80, 80, 80, 80, 80] // Fallback
    }
    
    // 过滤出该职责的所有选手
    const rolePlayers = props.allPlayers.filter(p => p.role === role)
    if (rolePlayers.length === 0) return [80, 80, 80, 80, 80]

    // 初始化五个维度的总和
    const sums = [0, 0, 0, 0, 0]
    
    rolePlayers.forEach(p => {
      const stats = getStatsByRole(role, p.stats)
      stats.forEach((val, idx) => {
        sums[idx] += val
      })
    })

    // 计算平均值并保留一位小数（如果是整数则直接显示）
    return sums.map(sum => Number((sum / rolePlayers.length).toFixed(2)))
  }

    const option = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        let res = `<div style="font-weight:bold;margin-bottom:5px;">${params.name}</div>`;
        const indicators = getIndicatorsByRole(props.player.role, props.player.stats, props.allPlayers);
        
        indicators.forEach((ind, index) => {
          // Parse the title from the rich text format: "{title|Name}\n{value|88}" -> "Name"
          const match = ind.name.match(/\{title\|(.*?)\}/);
          const cleanTitle = match ? match[1] : ind.name;
          res += `
            <div style="display:flex;justify-content:space-between;margin:2px 0;">
              <span>${cleanTitle}:</span>
              <span style="font-weight:bold;margin-left:15px;">${params.value[index]}</span>
            </div>
          `;
        });
        return res;
      }
    },
    radar: {
      indicator: getIndicatorsByRole(props.player.role, props.player.stats, props.allPlayers),
      shape: 'polygon',
      splitNumber: 5,
      radius: '60%',
      axisName: {
        rich: {
          title: {
            color: '#666',
            fontFamily: 'Inter',
            fontSize: 12,
            fontWeight: 600,
            align: 'center',
            padding: [0, 0, 4, 0]
          },
          value: {
            color: '#111',
            fontFamily: 'Orbitron',
            fontSize: 16,
            fontWeight: 900,
            align: 'center'
          }
        },
        formatter: function (value) {
          return value;
        },
        margin: 15
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb', // Lighter grid lines like the reference
          width: 1
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#e5e7eb', // Lighter axis lines
          width: 1
        }
      }
    },
    series: [
      {
        name: '该职责平均',
        type: 'radar',
        data: [
          {
            value: getRenderStats(props.player.role, getAverageStats(props.player.role), props.allPlayers),
            name: '平均数据',
            symbol: 'circle',
            symbolSize: 4,
            itemStyle: {
              color: '#9ca3af'
            },
            lineStyle: {
              color: '#9ca3af', // Gray dashed line for average
              width: 2,
              type: 'dashed'
            },
            areaStyle: {
              color: 'rgba(243, 244, 246, 0.5)' // Light gray area for average
            }
          }
        ]
      },
      {
        name: '选手数据',
        type: 'radar',
        data: [
          {
            value: getRenderStats(props.player.role, getStatsByRole(props.player.role, props.player.stats), props.allPlayers),
            name: props.player.name,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#ff4600', // Brand orange color for emphasis
              borderWidth: 2,
              borderColor: '#ff4600'
            },
            lineStyle: {
              color: '#111',
              width: 3
            },
            areaStyle: {
              color: 'rgba(255, 70, 0, 0.15)' // Very light orange tint to match reference
            }
          }
        ],
        z: 3 // Ensure player data is drawn on top of average data
      }
    ]
  }

  chartInstance.setOption(option)
}

watch(() => props.player, () => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
  }
})
</script>
