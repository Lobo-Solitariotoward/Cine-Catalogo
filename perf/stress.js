import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001'

export const options = {
  stages: [
    { duration: '2m', target: 25 },
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 0 },
  ],
}

export default function () {
  const res = http.get(`${BASE_URL}/api/health`)
  check(res, { 'respuesta disponible': r => r.status < 500 })
  sleep(1)
}
