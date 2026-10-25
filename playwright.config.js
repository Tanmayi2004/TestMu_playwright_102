const{
    defineConfig, 
    devices} = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    fullyParallel: true,
    workers: 2,
    timeout: 60000,

    expect:{
        timeout: 10000
    },
    reporter:[['list'], ['html', { outputFolder: 'playwright-report',open: 'never'}]],
    outputDir: 'test-results',
    use: {
        baseURL: 'https://www.testmuai.com/selenium-playground/',
        headless:true,
        screenshot:'on',
        video: 'on',
        trace: 'on'
    },
    projects:[
        {
            name: 'chromium',
            use:{
                ...devices['Desktop Chrome']
            }
        },
        {
            name: 'firefox',
            use:{
                ...devices['Desktop Firefox']
            }
        }
    ]
});