<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import { PhArrowLeft, PhLightning, PhScales, PhRobot } from '@phosphor-icons/vue';

const teams = ref([]);
const homeId = ref("");
const awayId = ref("");
const prediction = ref(null);
const loading = ref(false);
const error = ref("");

onMounted(async () => {
  try {
    const res = await api.get('/teams');
    teams.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
});

const homeTeam = computed(() => teams.value.find(t => t.id === homeId.value));
const awayTeam = computed(() => teams.value.find(t => t.id === awayId.value));

const predictMatch = async () => {
  if (!homeId.value || !awayId.value) return;
  if (homeId.value === awayId.value) {
    error.value = "Un equipo no puede jugar contra sí mismo.";
    prediction.value = null;
    return;
  }

  loading.value = true;
  error.value = "";
  prediction.value = null;

  try {
    const res = await api.post('/matches/predict', {
      homeId: homeId.value,
      awayId: awayId.value
    });
    prediction.value = res.data.data;
  } catch (err) {
    error.value = "Error al generar predicción. Intenta nuevamente.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto min-h-screen">
    
    <div class="flex justify-between items-center mb-8">
      <RouterLink to="/" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <PhArrowLeft /> Volver
      </RouterLink>
      <div class="flex items-center gap-2 text-sport-primary font-bold">
        <PhRobot :size="24" />
        <span>AI Powered Engine</span>
      </div>
    </div>

    <h1 class="text-3xl font-bold text-center mb-2">Simulador de Partidos</h1>
    <p class="text-gray-400 text-center mb-10">Selecciona dos equipos y deja que el modelo matemático prediga el resultado.</p>

    <div class="bg-sport-card p-8 rounded-3xl border border-gray-700 shadow-xl mb-8 relative overflow-hidden">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gray-700 hidden md:block"></div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        
        <div class="flex flex-col items-center gap-4">
          <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
            <img v-if="homeTeam" :src="homeTeam.logo_url" class="w-16 h-16 object-contain" />
            <span v-else class="text-gray-600 text-3xl font-bold">L</span>
          </div>
          <select v-model="homeId" class="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-sport-primary outline-none">
            <option value="" disabled>Selecciona Local</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-2 rounded-full border border-gray-600 z-20">
          <span class="font-black text-xl text-gray-400">VS</span>
        </div>

        <div class="flex flex-col items-center gap-4">
          <div class="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center border-2 border-dashed border-gray-600">
            <img v-if="awayTeam" :src="awayTeam.logo_url" class="w-16 h-16 object-contain" />
            <span v-else class="text-gray-600 text-3xl font-bold">V</span>
          </div>
          <select v-model="awayId" class="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-white focus:border-sport-primary outline-none">
            <option value="" disabled>Selecciona Visitante</option>
            <option v-for="t in teams" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
        </div>

      </div>

      <div class="mt-8 text-center">
        <button 
          @click="predictMatch"
          :disabled="loading || !homeId || !awayId"
          class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
        >
          <span v-if="loading" class="animate-spin">⌛</span>
          <span v-else><PhLightning :size="20" weight="fill" /></span>
          {{ loading ? 'Calculando...' : 'Predecir Resultado' }}
        </button>
        <p v-if="error" class="text-red-400 mt-4 text-sm">{{ error }}</p>
      </div>
    </div>

    <div v-if="prediction" class="animate-fade-in space-y-6">
      
      <div class="bg-sport-card p-6 rounded-2xl border border-gray-700">
        <h3 class="text-center text-gray-400 mb-4 uppercase text-xs font-bold tracking-widest">Probabilidades de Victoria</h3>
        
        <div class="flex h-12 rounded-lg overflow-hidden font-bold text-sm">
          <div class="bg-sport-primary flex items-center justify-center text-white transition-all duration-1000" :style="{ width: prediction.prediction.probabilities.home_win }">
            {{ prediction.prediction.probabilities.home_win }}
          </div>
          <div class="bg-gray-600 flex items-center justify-center text-gray-300 transition-all duration-1000" :style="{ width: prediction.prediction.probabilities.draw }">
            Draw
          </div>
          <div class="bg-sport-accent flex items-center justify-center text-white transition-all duration-1000" :style="{ width: prediction.prediction.probabilities.away_win }">
            {{ prediction.prediction.probabilities.away_win }}
          </div>
        </div>
        
        <div class="flex justify-between mt-2 text-xs text-gray-400">
          <span>{{ homeTeam.name }}</span>
          <span>Empate: {{ prediction.prediction.probabilities.draw }}</span>
          <span>{{ awayTeam.name }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 text-center">
          <div class="flex items-center justify-center gap-2 mb-2 text-gray-400">
            <PhScales :size="20"/> Goles Esperados (xG)
          </div>
          <div class="flex justify-center items-end gap-4">
            <div>
              <span class="text-4xl font-bold text-sport-primary">{{ prediction.prediction.expected_goals.home }}</span>
              <p class="text-xs text-gray-500 mt-1">Local</p>
            </div>
            <span class="text-2xl text-gray-600 mb-2">:</span>
            <div>
              <span class="text-4xl font-bold text-sport-accent">{{ prediction.prediction.expected_goals.away }}</span>
              <p class="text-xs text-gray-500 mt-1">Visitante</p>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-gray-800 to-purple-900/20 p-6 rounded-2xl border border-purple-500/30">
          <h3 class="font-bold text-purple-300 mb-3 flex items-center gap-2">
            <PhRobot :size="20"/> Análisis del Modelo
          </h3>
          <ul class="space-y-2">
            <li v-for="(reason, idx) in prediction.explanation" :key="idx" class="flex gap-2 text-sm text-gray-300">
              <span class="text-purple-500">•</span> {{ reason }}
            </li>
          </ul>
        </div>
      </div>

    </div>

  </div>
</template>