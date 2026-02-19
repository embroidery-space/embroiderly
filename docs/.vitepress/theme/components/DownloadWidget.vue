<script lang="ts" setup>
const { title, description } = defineProps<{
  title: string;
  description: string;
}>();

async function download(installer: "exe" | "deb" | "rpm") {
  const response = await fetch("https://api.github.com/repos/embroidery-space/embroiderly/releases/latest");
  const release = await response.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asset = release.assets.find((asset: any) => asset.browser_download_url.endsWith(installer));
  window.open(asset.browser_download_url);
}
</script>

<!-- eslint-disable vue-i18n/no-raw-text -->
<template>
  <div class="download-page">
    <div class="download-hero">
      <h1>{{ title }}</h1>
      <p>{{ description }}</p>
    </div>

    <div class="download-platforms">
      <div class="platform-card">
        <div class="platform-logo">
          <img src="/images/download/windows-logo.png" alt="Windows logo" />
        </div>
        <div class="download-buttons">
          <button @click="() => download('exe')">
            <div class="installer-package">Windows</div>
            <div class="installer-platform">Windows 10, 11</div>
          </button>
        </div>
      </div>

      <div class="platform-card">
        <div class="platform-logo">
          <img src="/images/download/linux-logo.png" alt="Linux logo" />
        </div>
        <div class="download-buttons">
          <button @click="() => download('deb')">
            <div class="installer-package">.deb</div>
            <div class="installer-platform">Debian, Ubuntu</div>
          </button>
          <button @click="() => download('rpm')">
            <div class="installer-package">.rpm</div>
            <div class="installer-platform">Red Hat, Fedora, SUSE</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.download-page {
  max-width: 1200px;
  min-height: 100%;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.download-hero {
  text-align: center;
}

.download-hero h1 {
  font-size: 3rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--vp-c-brand-1);
}

.download-hero p {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
}

.download-platforms {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
}

.platform-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.platform-logo {
  margin: 0 auto;
}

.platform-logo img {
  max-height: 6rem;
}

.download-buttons {
  display: flex;
  gap: 0.5rem;
}

.download-buttons button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: var(--vp-button-brand-text);
  background: var(--vp-button-brand-bg);
  transition: all 0.2s ease;
}

.download-buttons button:hover {
  color: var(--vp-button-brand-hover-text);
  background: var(--vp-button-brand-hover-bg);
}

.download-buttons button:active {
  color: var(--vp-button-brand-active-text);
  background: var(--vp-button-brand-active-bg);
}

.installer-package {
  font-size: 1.1rem;
  font-weight: 700;
  text-align: center;
}

.installer-platform {
  font-weight: 400;
}

@media (max-width: 768px) {
  .download-hero h1 {
    font-size: 2rem;
  }

  .download-hero p {
    font-size: 1rem;
  }

  .download-platforms {
    gap: 1rem;
  }
}
</style>
