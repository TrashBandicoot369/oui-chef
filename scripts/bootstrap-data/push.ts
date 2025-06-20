import fs from 'fs'
import path from 'path'
import { db } from '../../lib/firebase-admin'

async function push() {
  const base = __dirname
  const read = (file: string) => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'))

  const siteCopy = read('siteCopy.json')
  const menu = read('menu.json')
  const testimonials = read('testimonials.json')
  const gallery = read('gallery.json')
  const theme = read('theme.json')

  const batch = db.batch()

  batch.set(db.collection('siteCopy').doc('content'), siteCopy)
  menu.forEach((text: string, i: number) => {
    batch.set(db.collection('menu').doc(String(i)), { index: i, text })
  })
  testimonials.forEach((text: string, i: number) => {
    batch.set(db.collection('testimonials').doc(String(i)), { index: i, text })
  })
  gallery.forEach((g: any) => {
    batch.set(db.collection('gallery').doc(String(g.id)), g)
  })
  batch.set(db.collection('theme').doc('default'), theme)

  await batch.commit()
  console.log('Firestore bootstrap complete')
}

push().catch(err => {
  console.error(err)
  process.exit(1)
})
