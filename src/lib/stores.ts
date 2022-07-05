import { writable } from 'svelte/store';
import type { MacawCore } from 'macaw-threejs';

export const isDarkMode = writable(false);
export const macaw = writable<MacawCore>();
