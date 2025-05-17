<script setup></script>

<template>
  <router-view></router-view>
</template>

<style>
@import './assets/styles/variables.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  background-color: var(--neutral-50);
  color: var(--neutral-900);
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Global button styles */
button {
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
}

/* Global link styles */
a {
  color: var(--primary-color);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--primary-dark);
}

/* Global heading styles */
h1,
h2,
h3,
h4,
h5,
h6 {
  color: var(--neutral-900);
  line-height: 1.2;
  margin-bottom: 0.5em;
}

/* Global paragraph styles */
p {
  color: var(--neutral-700);
  margin-bottom: 1rem;
}
</style>
