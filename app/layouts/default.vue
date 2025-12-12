<template>
  <v-app>
    <v-main class="app-background">
      <slot />
    </v-main>
  </v-app>
</template>

<style>
.app-background {
  background: radial-gradient(
    circle at top center,
    #1e293b 0%,
    #0f172a 50%,
    #020617 100%
  ) !important;
  min-height: 100vh;
}

::-webkit-scrollbar {
  width: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 5px;
  border: 2px solid #0f172a;
}
::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
</style>
