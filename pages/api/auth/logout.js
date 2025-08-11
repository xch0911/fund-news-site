import { clearTokenCookie } from '../../../lib/auth'
export default function handler(req,res){
  clearTokenCookie(res)
  res.json({ ok: true })
}
