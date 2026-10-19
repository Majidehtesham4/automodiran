import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/browser', timeout:180000, workers:1,
  use:{baseURL:'http://127.0.0.1:5188',viewport:{width:1440,height:1000},launchOptions:{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}},
  webServer:{command:'npm run dev -- --port 5188 --strictPort',url:'http://127.0.0.1:5188',reuseExistingServer:false,timeout:30000},
});
