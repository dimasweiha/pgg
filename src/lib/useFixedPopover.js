import { useEffect, useRef, useState } from 'react'

/**
 * useFixedPopover — posisi popover `position: fixed` menempel ke tombol trigger.
 * Popover bebas dari container scroll (mis. modal `overflow-y-auto`) supaya
 * selalu terlihat penuh tanpa perlu scroll (revisi Dimas 6 Okt).
 * Mengikuti scroll & resize.
 *
 * Default membuka ke bawah. Opsi:
 * - flip: true → buka ke atas bila ruang bawah kurang (dipakai DropdownSelect)
 * - flip: false → selalu ke bawah, apa pun kondisinya (revisi Dimas 6 Okt
 *   untuk kalender: "jangan buat terbuka keatas, tapi dibawahnya aja")
 *
 * @param {boolean} open - popover terbuka?
 * @param {object} opsi - { tinggi?: number (estimasi tinggi popover), flip?: boolean }
 * @returns {{ triggerRef: React.RefObject, pos: {top?,bottom?,left,width}|null }}
 */
export default function useFixedPopover(open, { tinggi = 300, flip = true } = {}) {
  const triggerRef = useRef(null)
  const [pos, setPos] = useState(null)

  useEffect(() => {
    if (!open) return
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const ruangBawah = window.innerHeight - rect.bottom
      const bukaKeAtas = flip && ruangBawah < tinggi && rect.top > ruangBawah
      setPos({
        left: rect.left,
        width: Math.max(rect.width, 272),
        ...(bukaKeAtas
          ? { bottom: window.innerHeight - rect.top + 6 }
          : { top: rect.bottom + 6 }),
      })
    }
    update()
    // capture=true menangkap scroll di dalam container mana pun (termasuk panel modal)
    window.addEventListener('resize', update)
    document.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      document.removeEventListener('scroll', update, true)
    }
    // oxlint-disable-next-line set-state-in-effect
  }, [open, tinggi, flip])

  return { triggerRef, pos }
}
