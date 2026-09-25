import { useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'
import { Camera, Dices, ImagePlus, ListChecks, Minus, Plus, RotateCcw, Sparkles, Upload, WandSparkles } from 'lucide-react'
import lsrLogo from '../lsr.png'
import './App.css'

function App() {
  const [names, setNames] = useState<string[]>([])
  const [nameWinner, setNameWinner] = useState('')
  const [numberWinner, setNumberWinner] = useState<number | null>(null)
  const [start, setStart] = useState('1')
  const [end, setEnd] = useState('100')
  const [isReading, setIsReading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Sube una o varias imágenes con nombres')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const cleanText = (text: string) => text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•·]|\d+[.)])\s*/, '').trim())
    .filter((line) => line.length > 1 && /[a-záéíóúüñ]/i.test(line))

  const readImages = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (!imageFiles.length) return
    setIsReading(true)
    setNameWinner('')
    setStatus('Preparando el lector de texto...')
    setProgress(0)
    const worker = await createWorker('spa', 1, { logger: (message) => setProgress(Math.round((message.progress ?? 0) * 100)) })
    try {
      const foundNames: string[] = []
      for (let index = 0; index < imageFiles.length; index += 1) {
        setStatus(`Leyendo imagen ${index + 1} de ${imageFiles.length}`)
        const result = await worker.recognize(imageFiles[index])
        foundNames.push(...cleanText(result.data.text))
      }
      const uniqueNames = [...new Set([...names, ...foundNames])]
      setNames(uniqueNames)
      setStatus(uniqueNames.length ? `${uniqueNames.length} nombres listos para sortear` : 'No se encontraron nombres claros')
    } catch {
      setStatus('No se pudo leer la imagen. Prueba con una foto más nítida.')
    } finally {
      await worker.terminate()
      setIsReading(false)
      setProgress(100)
    }
  }

  const pickName = () => {
    if (names.length) setNameWinner(names[Math.floor(Math.random() * names.length)])
  }

  const pickNumber = () => {
    const first = Number.parseInt(start, 10)
    const last = Number.parseInt(end, 10)
    if (Number.isInteger(first) && Number.isInteger(last) && first <= last) setNumberWinner(Math.floor(Math.random() * (last - first + 1)) + first)
  }

  const updateName = (index: number, value: string) => setNames((current) => current.map((name, nameIndex) => nameIndex === index ? value : name))
  const removeName = (index: number) => {
    setNames((current) => current.filter((_, nameIndex) => nameIndex !== index))
    setNameWinner('')
  }

  return (
    <main className="app-shell">
      <header className="topbar"><div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>AZAR</span></div><div className="header-meta"><img className="lsr-logo" src={lsrLogo} alt="Latin Social Run" /><span className="privacy-note">Todo ocurre en tu navegador</span></div></header>
      <section className="intro"><p className="eyebrow">SORTEOS SIN COMPLICACIONES</p><h1>Que el azar<br /><em>decida por ti.</em></h1><p className="intro-copy">Convierte tus imágenes en una lista y deja que un sorteo transparente elija el resultado.</p></section>
      <section className="workspace">
        <div className="panel panel-names">
          <div className="panel-heading"><div><span className="step-number">01</span><h2>Lista de nombres</h2></div><span className="count-badge">{names.length} {names.length === 1 ? 'nombre' : 'nombres'}</span></div>
          <div className={`drop-zone ${isReading ? 'is-reading' : ''}`} onClick={() => !isReading && fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => event.key === 'Enter' && fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(event) => event.target.files && readImages(event.target.files)} />
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={(event) => event.target.files && readImages(event.target.files)} />
            <div className="upload-icon">{isReading ? <WandSparkles size={22} /> : <ImagePlus size={22} />}</div><strong>{isReading ? 'Leyendo nombres...' : 'Sube tus imágenes'}</strong><span>{isReading ? `${progress}% completado` : 'JPG, PNG o WEBP · puedes elegir varias'}</span>{isReading && <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>}
          </div>
          <div className="status-line"><span className={isReading ? 'status-dot active' : 'status-dot'} />{status}</div>
          {names.length > 0 ? <div className="names-list">{names.map((name, index) => <div className="name-row" key={`${name}-${index}`}><span className="row-index">{String(index + 1).padStart(2, '0')}</span><input value={name} aria-label={`Nombre ${index + 1}`} onChange={(event) => updateName(index, event.target.value)} /><button className="icon-button" type="button" title="Eliminar nombre" onClick={() => removeName(index)}><Minus size={15} /></button></div>)}</div> : <div className="empty-list"><ListChecks size={20} /><span>Tu lista aparecerá aquí</span></div>}
          <div className="panel-actions"><button className="secondary-button" type="button" onClick={() => fileInputRef.current?.click()} disabled={isReading}><Upload size={15} />Añadir imágenes</button><button className="secondary-button" type="button" onClick={() => cameraInputRef.current?.click()} disabled={isReading}><Camera size={15} />Abrir cámara</button>{names.length > 0 && <button className="text-button" type="button" onClick={() => { setNames([]); setNameWinner(''); setStatus('Sube una o varias imágenes con nombres') }}><RotateCcw size={14} />Limpiar</button>}</div>
        </div>
        <div className="panel panel-lottery">
          <div className="panel-heading"><div><span className="step-number">02</span><h2>Elige un ganador</h2></div></div>
          <div className="winner-display name-display"><span>GANADOR DE LA LISTA</span><strong className={nameWinner ? 'has-winner' : ''}>{nameWinner || '—'}</strong></div><button className="primary-button" type="button" onClick={pickName} disabled={!names.length}><Dices size={18} />Sortear nombre</button>
          <div className="divider"><span>o sortea un número</span></div><div className="range-inputs"><label>DESDE<input type="number" value={start} onChange={(event) => setStart(event.target.value)} /></label><span className="range-separator">→</span><label>HASTA<input type="number" value={end} onChange={(event) => setEnd(event.target.value)} /></label></div>
          <div className="winner-display number-display"><span>NÚMERO ELEGIDO</span><strong className={numberWinner !== null ? 'has-winner' : ''}>{numberWinner ?? '—'}</strong></div><button className="outline-button" type="button" onClick={pickNumber}><Plus size={17} />Sortear número</button>{start && end && Number(start) > Number(end) && <p className="error-message">El inicio debe ser menor o igual que el final.</p>}
        </div>
      </section>
      <footer><span>AZAR · SORTEOS LOCALES</span><span><span className="footer-dot" />Tus datos no salen de este dispositivo</span></footer>
    </main>
  )
}

export default App
