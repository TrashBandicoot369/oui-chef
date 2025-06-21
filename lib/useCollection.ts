'use client'
import { useEffect, useState } from 'react'
import { collection, getDocs, orderBy, query, DocumentData } from 'firebase/firestore'
import { db } from './firebaseClient'

export default function useCollection<T = DocumentData>(col: string, order = 'order') {
  const [data, setData] = useState<T[]>([])
  useEffect(() => {
    getDocs(query(collection(db, col), orderBy(order)))
      .then(snap => setData(snap.docs.map(d => ({ id: d.id, ...d.data() }) as T)))
  }, [col, order])
  return data
} 