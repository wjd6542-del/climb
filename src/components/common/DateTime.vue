<template>
  <span>{{ formatted }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  value?: string;
  format?: string;
  timezone?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: "",
  format: "YYYY-MM-DD HH:mm:ss",
  timezone: "Asia/Seoul",
});

const formatted = computed(() => {
  if (!props.value) return "-";

  const date = new Date(props.value);
  if (isNaN(date.getTime())) return "-";

  const tzDate = new Date(
    date.toLocaleString("en-US", { timeZone: props.timezone }),
  );

  const yyyy = tzDate.getFullYear();
  const mm = String(tzDate.getMonth() + 1).padStart(2, "0");
  const dd = String(tzDate.getDate()).padStart(2, "0");
  const hh = String(tzDate.getHours()).padStart(2, "0");
  const mi = String(tzDate.getMinutes()).padStart(2, "0");
  const ss = String(tzDate.getSeconds()).padStart(2, "0");

  return props.format
    .replace("YYYY", String(yyyy))
    .replace("MM", mm)
    .replace("DD", dd)
    .replace("HH", hh)
    .replace("mm", mi)
    .replace("ss", ss);
});
</script>
