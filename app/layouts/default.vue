<template>
  <div>
    <TemplateHeader />
    <slot />
    <TemplateMobileNavigation />
  </div>
</template>

<script setup lang="ts">
import { pageSeo, defaultSeo } from '~/utils/constants/web/seo';

const route = useRoute();

// Support SEO values as string or function(route)
const resolveSeoValue = (value: any) => {
  if (!value) return '';
  return typeof value === 'function' ? value(route) : value;
};

const currentSeo = computed(() => {
  const key = (route?.name || route.path) as string;
  const cfg = pageSeo[key] || defaultSeo;

  return {
    title: resolveSeoValue(cfg.title) || defaultSeo.title,
    description: resolveSeoValue(cfg.description) || defaultSeo.description,
    image: resolveSeoValue(cfg.image) || defaultSeo.image,
  };
});

useSeoMeta({
  title: () => currentSeo.value.title,
  description: () => currentSeo.value.description,

  // Open Graph
  ogTitle: () => currentSeo.value.title,
  ogDescription: () => currentSeo.value.description,
  ogImage: () => currentSeo.value.image,

  // Twitter
  twitterCard: () => 'summary_large_image',
  twitterTitle: () => currentSeo.value.title,
  twitterDescription: () => currentSeo.value.description,
  twitterImage: () => currentSeo.value.image,
});
</script>