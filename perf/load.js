import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001'

export const options = {
  stages: [
    { duration: '5m', target: 20 },
    { duration: '10m', target: 20 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<750'],
  },
}

export default function () {
  const res = http.get(`${BASE_URL}/api/health`)
  check(res, { 'health 200': r => r.status === 200 })
  sleep(1)
}
