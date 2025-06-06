<template>
    <div class="max-w-4xl mx-auto p-6 space-y-6">
        <h2>Ubicaciones</h2>

        <div v-for="(info, location) in spawnInfo" :key="location" class="bg-white p-4 shadow rounded">
            <div class="flex justify-between items-center mb-4">
                <h3>{{ info.name }}</h3>
                <div class="flex gap-2">
                    <button class="btn btn-primary" @click="openSpawnConfig(location, true)">
                        Agregar objetos a buscar
                    </button>
                    <button class="btn btn-secondary" @click="openSpawnConfig(location, false)">
                        Agregar objetos distractores
                    </button>
                </div>
            </div>
            <div v-if="selectedItems['searchItems'][location]">
                <div v-if="selectedItems['searchItems'][location]['items'].length">
                    {{ getItemCountText(selectedItems['searchItems'][location]['items'], 'item a buscar', 'items a buscar') }}
                </div>
                <div v-if="selectedItems['distractingItems'][location]">
                    <div v-if="selectedItems['distractingItems'][location]['items'].length">
                        {{ getItemCountText(selectedItems['distractingItems'][location].items,
                            'item distractor', 'items distractores') }}
                    </div>
                </div>
            </div>
        </div>

        <!-- Spawn Config Window -->
        <SpawnConfig v-if="showModal" :location="selectedLocation" :config="spawnInfo[selectedLocation]"
            :items="selectedItems[listToCheck][selectedLocation]['items'] || []" :isKey="isKeyItem"
            :alreadySelectedItems="alreadySelectedItems" @close="showModal = false" @update-items="updateItems" />
    </div>
    <div class="max-w-3xl mx-auto p-4 flex justify-between">
        <button class="btn btn-secondary" @click="goBack">
            Salir sin guardar
        </button>
        <button class="btn btn-primary" @click="saveSettings">
            Guardar cambios
        </button>
    </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import spawnInfo from "@/data/spawnInfo.json";
import SpawnConfig from "@/components/SpawnConfig.vue";
import { tempLevels } from "@/data/tempLevelData.js";

const route = useRoute();
const router = useRouter();

const levelKey = route.query.level;
const selectedItems = reactive({
    searchItems: {

    },
    distractingItems: {

    }
});
const showModal = ref(false);
const selectedLocation = ref(null);
const isKeyItem = ref(false);
const listToCheck = ref("");
const alreadySelectedItems = ref({});

onMounted(() => {
    try {
        console.log(levelKey);
        selectedItems.searchItems = tempLevels[levelKey]?.searchItems || {};
        selectedItems.distractingItems = tempLevels[levelKey]?.distractingItems || {};
    } catch (e) {
        console.warn("No se pudieron cargar los objetos del nivel:", e);
    }
});

const getItemCountText = (items, singular, plural) => {
    console.log("COUNT TEXT" + items);
    const count = items.length;
    return `${count} ${count === 1 ? singular : plural}: ${items.join(', ')}`;
};

// Returns to the LevelSettingsPage with the same query values as before
const goBack = () => {
    router.push({ name: 'LevelSettingsPage', query: route.query })
};

// Open the SpawnConfig window with the proper values.
const openSpawnConfig = (location, isKey) => {
    selectedLocation.value = location;
    isKeyItem.value = isKey;
    listToCheck.value = isKeyItem.value ? "searchItems" : "distractingItems";
    alreadySelectedItems.value = getAlreadySelectedItems(location, isKeyItem.value);
    console.log(alreadySelectedItems);
    showModal.value = true;
};

const updateItems = (location, items, isKey) => {
    const type = isKey ? 'searchItems' : 'distractingItems';
    console.log("ITEMS TIENE " + items);
    selectedItems[type][location]['items'] = items;
    console.log("SELECTED TIENE: " + selectedItems[type][location]['items'])
    console.log("SELECTED TIENE LONGITUD: " + selectedItems[type][location]['items'].length)
    showModal.value = false;
};

const saveSettings = () => {
    tempLevels[levelKey].searchItems = selectedItems.searchItems;
    tempLevels[levelKey].distractingItems = selectedItems.distractingItems;
    router.push({
        path: "/level-settings",
        query: {
            ...route.query,
        }
    });
};

const getAlreadySelectedItems = (currentLocation, isKey) => {
    const usedItems = [];
    const typeToCheck = isKey ? "searchItems" : "distractingItems";

    for (const [type, locations] of Object.entries(selectedItems)) {
        for (const [loc, items] of Object.entries(locations)) {
            const isSameType = type === typeToCheck;
            const isSameLocation = loc === currentLocation;

            // Evitar incluir los del mismo tipo y misma locación
            if (!isSameType || !isSameLocation) {
                if (items?.items?.length) {
                    usedItems.push(...items.items);
                }
            }
        }
    }

    return usedItems;
};
</script>