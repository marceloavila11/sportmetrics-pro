<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router'; 
import api from '../services/api';
import { PhArrowLeft, PhStrategy, PhUsers, PhChartLineUp, PhShieldCheck, PhSoccerBall } from '@phosphor-icons/vue';

const route = useRoute();
const teamId = route.params.id; 

const team = ref(null);      
const analytics = ref(null); 
const coach = ref(null);     
const players = ref([]);     
const loading = ref(true);

const loadDashboard = async () => {
  try {
    const [statsRes, coachRes, playersRes, teamsRes] = await Promise.all([
      api.get(`/teams/${teamId}/analytics`),
      
      api.get(`/coaches/team/${teamId}`).catch(() => ({ data: { data: null } })),
      
      api.get(`/players/team/${teamId}`),
      api.get('/teams')
    ]);

    analytics.value = statsRes.data.data;
    coach.value = coachRes.data.data; 
    players.value = playersRes.data.data;
    
    const allTeams = teamsRes.data.data;
    team.value = allTeams.find(t => t.id == teamId);

  } catch (error) {
    console.error("Error cargando dashboard:", error);    
  } finally {
    loading.value = false;
  }
};

onMounted(() => loadDashboard());
</script>

<template>
  <div v-if="!loading && team" class="p-8 max-w-7xl mx-auto animate-fade-in">
    
    <RouterLink to="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
      <PhArrowLeft /> Volver a la Liga
    </RouterLink>

    <div class="bg-gradient-to-r from-sport-card to-gray-800 rounded-3xl p-8 mb-8 border border-gray-700 flex flex-col md:flex-row items-center gap-8">
      <img :src="team.logo_url" class="w-32 h-32 object-contain drop-shadow-2xl" />
      <div class="text-center md:text-left">
        <h1 class="text-4xl font-bold mb-2">{{ team.name }}</h1>
        <p class="text-gray-400 text-lg flex items-center gap-2">
          🏟️ {{ team.stadium_name }}
        </p>
      </div>
      
      <div class="md:ml-auto flex gap-4">
        <div class="text-center bg-gray-900/50 p-4 rounded-xl border border-gray-600">
          <span class="block text-2xl font-bold text-sport-accent">{{ analytics.overview.win_rate }}</span>
          <span class="text-xs text-gray-400 uppercase">Win Rate</span>
        </div>
        <div class="text-center bg-gray-900/50 p-4 rounded-xl border border-gray-600">
          <span class="block text-2xl font-bold text-sport-primary">{{ analytics.attack.avg_goals_per_game }}</span>
          <span class="text-xs text-gray-400 uppercase">Goles/P</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="space-y-6">
        <div class="bg-sport-card p-6 rounded-2xl border border-gray-700">
          <div class="flex items-center gap-3 mb-4 border-b border-gray-700 pb-3">
            <PhStrategy :size="24" class="text-purple-400" />
            <h3 class="font-bold text-lg">Director Técnico</h3>
          </div>
          
          <div v-if="coach">
            <div class="text-center mb-4">
              <div class="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center text-2xl">👔</div>
              <h4 class="text-xl font-bold">{{ coach.name }}</h4>
              <span class="text-sm text-gray-400">{{ coach.nationality }}</span>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Estilo:</span>
                <span class="text-white font-medium">{{ coach.metrics.tactical_style }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Partidos:</span>
                <span>{{ coach.metrics.matches_managed }}</span>
              </div>
              <div class="flex flex-wrap gap-2 mt-4">
                <span v-for="tag in coach.metrics.tags" :key="tag" class="text-xs bg-purple-900/30 text-purple-300 px-2 py-1 rounded border border-purple-800">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">🤷‍♂️</div>
            <p>Sin datos de DT registrados</p>
          </div>
        </div>
      </div>

      <div class="lg:col-span-2 bg-sport-card rounded-2xl border border-gray-700 overflow-hidden">
        <div class="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 class="font-bold text-lg flex items-center gap-2">
            <PhUsers :size="24" class="text-blue-400"/> Plantilla
          </h3>
          <span class="text-sm text-gray-400">{{ players.length }} Jugadores</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-800 text-gray-400 uppercase font-semibold">
              <tr>
                <th class="p-4">Jugador</th>
                <th class="p-4">Posición</th>
                <th class="p-4 text-center">Goles</th>
                <th class="p-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="player in players" :key="player.id" class="hover:bg-gray-700/50 transition-colors">
                <td class="p-4 font-medium">{{ player.name }}</td>
                <td class="p-4">
                  <span 
                    class="px-2 py-1 rounded text-xs border"
                    :class="{
                      'border-blue-500 text-blue-300 bg-blue-900/20': player.position === 'Forward',
                      'border-green-500 text-green-300 bg-green-900/20': player.position === 'Midfielder',
                      'border-yellow-500 text-yellow-300 bg-yellow-900/20': player.position === 'Defender',
                      'border-gray-500 text-gray-300 bg-gray-900/20': player.position === 'Goalkeeper',
                    }"
                  >
                    {{ player.position }}
                  </span>
                </td>
                <td class="p-4 text-center font-bold text-white">{{ player.total_goals }}</td>
                <td class="p-4 text-center">
                  <span class="font-bold" :class="player.average_rating >= 7.0 ? 'text-green-400' : 'text-gray-400'">
                    {{ player.average_rating }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="animate-spin text-sport-primary">
      <PhSoccerBall :size="48" weight="duotone" />
    </div>
  </div>
</template>