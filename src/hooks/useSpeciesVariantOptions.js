import { useState, useEffect } from 'react'
import { speciesApi } from '../api/species'
import { speciesVariantsApi } from '../api/speciesVariantsApi'

export function useSpeciesVariantOptions() {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [speciesResult] = await Promise.allSettled([
          speciesApi.getAll(1, 1000),
        ])
        if (cancelled) return
        if (speciesResult.status !== 'fulfilled') {
          setLoading(false)
          return
        }
        const speciesList = speciesResult.value.data?.Items || []

        const variantPromises = speciesList.map(s =>
          speciesVariantsApi.getBySpeciesId(s.Id)
            .then(r => r.data || [])
            .catch(() => [])
        )
        const allVariantArrays = await Promise.allSettled(variantPromises)
        if (cancelled) return

        const combined = []
        speciesList.forEach((s, i) => {
          const vars = allVariantArrays[i]?.status === 'fulfilled' ? allVariantArrays[i].value : []
          vars.forEach(v => {
            combined.push({
              value: v.Id.toString(),
              label: `${s.CommonName} — ${v.VariantName}`,
            })
          })
        })
        setOptions(combined)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return { options, loading }
}
