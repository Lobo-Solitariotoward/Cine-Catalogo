import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001'

export const options = {
  stages: [
    { duration: '5m', target: 20 },
    { duration: '2h', target: 20 },
    { duration: '5m', target: 0 },
  ],
}

export default function () {
  const res = http.get(`${BASE_URL}/api/health`)
  check(res, { 'soak health 200': r => r.status === 200 })
  sleep(1)
}
