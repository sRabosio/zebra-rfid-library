import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    port: 10300,
    https: false,
    strictPort: true,
    open: false,
    host: 'rfid.it-sol.it',
    watch: {
      ignored:['!eb.it-sol/**']
    }
  },
  plugins: [react()],
})
