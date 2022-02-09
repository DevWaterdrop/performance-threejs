const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',

	theme: {
		extend: {
			colors: {
				'sidebar-main': '#1A1C1E',
				'sidebar-second': '#262A30',
				'sidebar-third': '#272B2E',
				'sidebar-border': '#111315'
			}
		}
	},

	plugins: []
};

module.exports = config;
