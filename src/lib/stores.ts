import { writable } from 'svelte/store';
import type { MacawScene } from 'macaw-threejs';

export const isDarkMode = writable(false);
export const scene = writable<MacawScene | null>(null);
