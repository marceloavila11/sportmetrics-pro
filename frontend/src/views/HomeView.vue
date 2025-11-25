<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { PhSoccerBall, PhTrophy, PhTrendUp } from '@phosphor-icons/vue';

const teams = ref([]);
const loading = ref(true);

const fetchTeams = async () => {
  try {
    const response = await api.get('/teams');
    teams.value = response.data.data; 
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchTeams());
</script>

<template>
  <div class="p-8">
    <header class="max-w-7xl mx-auto mb-12 border-b border-gray-700 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="flex items-center gap-4">
        <div class="bg-sport-primary p-3 rounded-xl shadow-lg">
          <PhSoccerBall :size="40" color="white" weight="duotone" />
        </div>
        <div>
          <h1 class="text-3xl font-bold">SportMetrics Pro</h1>
          <p class="text-gray-400">LigaPro Ecuabet Analytics</p>
        </div>
      </div>

      <RouterLink 
        to="/predict" 
        class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-transform hover:scale-105"
      >
        <PhLightning :size="20" weight="fill" />
        Predecir Partido
      </RouterLink>
    </header>

    <div v-if="!loading" class="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="team in teams" :key="team.id" 
           class="group bg-sport-card rounded-2xl p-6 border border-gray-700 hover:border-sport-primary transition-all hover:-translate-y-1">
        
        <div class="flex flex-col items-center">
          <img :src="team.logo_url" class="w-24 h-24 object-contain mb-4 drop-shadow-md" />
          <h2 class="text-lg font-bold text-center mb-1">{{ team.name }}</h2>
          <span class="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded mb-4">{{ team.stadium_name }}</span>
          
          <RouterLink 
            :to="`/team/${team.id}`"
            class="w-full flex items-center justify-center gap-2 py-2 bg-sport-primary hover:bg-blue-600 rounded-lg text-sm font-medium transition-colors"
          >
            <PhTrendUp :size="18" />
            Ver Dashboard
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>