import http from 'k6/http'
import { check, sleep } from 'k6'

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3001'

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 10 },
  ],
}

export default function () {
  const res = http.get(`${BASE_URL}/api/health`)
  check(res, { 'spike sin error 5xx': r => r.status < 500 })
  sleep(1)
}
