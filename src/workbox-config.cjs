module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{json,js,ico,png,css,html,txt,md}',
	],
	globIgnores: [
		'**/package.json',
		'**/package-lock.json',
		'**/node_modules/**/*',
		'**/tsconfig.json',
		'**/src/**/*',
		'**/src-sw/**/*',
		'**/text/metadata/**/*',
	],	
	swDest: 'sutta-player-sw.js',
	swSrc: 'esm/sutta-player-sw-proxy.js'
};