import { Router } from 'express'
import { registerPerson } from './controller'

const router = Router()

router.get('/', (_, res) => res.sendStatus(200))

router.post('/', async (req, res) => {
  const { name, email, phoneNumber } = req.body

  if (!name || !email) {
    res.sendStatus(400)
    return
  }

  try {
    await registerPerson({ name, email, phoneNumber })
    res.sendStatus(200)
  } catch (err: any) {
    console.error(err.message)
    res.sendStatus(500)
  }
})

export default router