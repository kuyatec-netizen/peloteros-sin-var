
import { useState, useEffect, useRef } from 'react'
import './App.css'
import portada from './assets/portada-peloteros.png'
import { supabase } from './supabase'

function App() {

    useEffect(() => {
  const cargarEquipos = async () => {
    const { data, error } = await supabase
      .from('EQUIPOS')
      .select('*')

    if (error) {
      console.error('Error cargando equipos:', error)
      return
    }

    setEquipos(data.map((equipo) => equipo.Nombre))
    setEquiposBD(data)
  }

  cargarEquipos()
}, [])

  const [pantalla, setPantalla] = useState('inicio')
  const [clave, setClave] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [sesionActiva, setSesionActiva] = useState(false)
  const [errorAcceso, setErrorAcceso] = useState(false)
  const [equipos, setEquipos] = useState([])
  const [equiposBD, setEquiposBD] = useState([])
const [nuevoEquipo, setNuevoEquipo] = useState('')
const [equipoEditando, setEquipoEditando] = useState(null)
const [nombreEditado, setNombreEditado] = useState('')
const [jugadores, setJugadores] = useState([
  [], [], [], [], [], []
])

const [jugadoresDesactivados, setJugadoresDesactivados] = useState([
  [], [], [], [], [], []
])

const [equipoSeleccionado, setEquipoSeleccionado] = useState(null)
const [nuevoJugadorNombre, setNuevoJugadorNombre] = useState('')
const [partidosCargados, setPartidosCargados] = useState(false)
const [partidosBD, setPartidosBD] = useState([])
const [partidoSeleccionado, setPartidoSeleccionado] = useState('')
const [equipoLocalSeleccionado, setEquipoLocalSeleccionado] = useState('')
const [equipoVisitanteSeleccionado, setEquipoVisitanteSeleccionado] = useState('')
const [golesLocal, setGolesLocal] = useState(0)
const [golesVisitante, setGolesVisitante] = useState(0)
const [guardandoResultado, setGuardandoResultado] = useState(false)
const [editandoResultado, setEditandoResultado] = useState(false)
const [resultadoMensaje, setResultadoMensaje] = useState('')

const [calendario, setCalendario] = useState(() => {
  const guardado = localStorage.getItem('peloterosCalendario')

  if (guardado) {
    const datos = JSON.parse(guardado)

    return datos.map((jornada) => ({
      ...jornada,
      fecha: jornada.fecha || '',
      partidos: jornada.partidos.map((partido) => ({
        ...partido,
        hora: partido.hora || ''
      }))
    }))
  }

  return [
    { jornada: 1, fecha: '', partidos: [{ local: '', visitante: '', hora: '' }, { local: '', visitante: '', hora: '' }] },
    { jornada: 2, fecha: '', partidos: [{ local: '', visitante: '', hora: '' }, { local: '', visitante: '', hora: '' }] },
    { jornada: 3, fecha: '', partidos: [{ local: '', visitante: '', hora: '' }, { local: '', visitante: '', hora: '' }] },
    { jornada: 4, fecha: '', partidos: [{ local: '', visitante: '', hora: '' }, { local: '', visitante: '', hora: '' }] },
    { jornada: 5, fecha: '', partidos: [{ local: '', visitante: '', hora: '' }, { local: '', visitante: '', hora: '' }] }
  ]
})

const [jornadasConfirmadas, setJornadasConfirmadas] = useState([])

  const canvasMatrix = useRef(null)

useEffect(() => {
  const cargarPartidos = async () => {
    const { data: jornadasData, error: errorJornadas } = await supabase
  .from('jornadas')
  .select('*')

if (errorJornadas) {
  console.error('Error cargando jornadas:', errorJornadas)
} else {
  setJornadasConfirmadas(
    (jornadasData || [])
      .filter((j) => j.confirmada)
      .map((j) => j.jornada)
  )
}
    const { data, error } = await supabase
      .from('PARTIDOS')
      .select('*')
      .order('jornada')
      .order('numero_partido')

    if (error) {
      console.error('Error cargando partidos:', error)
      return
    }
    setPartidosBD(data || [])

    if (!data || data.length === 0) {
  setPartidosCargados(true)
  return
}

    const { data: equiposData, error: errorEquipos } = await supabase
      .from('EQUIPOS')
      .select('*')

    if (errorEquipos) {
      console.error('Error cargando equipos:', errorEquipos)
      return
    }

    
setCalendario((anterior) => {
  const nuevoCalendario = anterior.map((jornada) => ({
    ...jornada,
    partidos: jornada.partidos.map((partido) => ({ ...partido }))
  }))

  data.forEach((partido) => {
    const indice = partido.jornada - 1

    while (nuevoCalendario.length <= indice) {
      nuevoCalendario.push({
        jornada: nuevoCalendario.length + 1,
        fecha: '',
        partidos: []
      })
    }

    const jornadaActual = nuevoCalendario[indice]
    const indicePartido = partido.numero_partido - 1

    while (jornadaActual.partidos.length <= indicePartido) {
      jornadaActual.partidos.push({
        local: '',
        visitante: '',
        hora: ''
      })
    }

    const local = equiposData.find(
      (e) => String(e.Id ?? e.id) === String(partido.equipo_local_id)
    )

    const visitante = equiposData.find(
      (e) => String(e.Id ?? e.id) === String(partido.equipo_visitante_id)
    )

    jornadaActual.fecha =
      partido.fecha_partido || jornadaActual.fecha || ''

    jornadaActual.partidos[indicePartido] = {
      local: local?.Nombre ?? '',
      visitante: visitante?.Nombre ?? '',
      hora: partido.hora_partido
        ? partido.hora_partido.slice(0, 5)
        : jornadaActual.partidos[indicePartido].hora || ''
    }
  })

  return nuevoCalendario
})

        setPartidosCargados(true)
  }

  cargarPartidos()
}, [])

useEffect(() => {
  const cargarJugadores = async () => {
    if (equipoSeleccionado === null) return

    const { data: equipoData, error: errorEquipo } = await supabase
      .from('EQUIPOS')
      .select('*')
      .eq('Nombre', equipos[equipoSeleccionado])
      .single()

    if (errorEquipo) {
      console.error('Error buscando equipo:', errorEquipo)
      return
    }

    const equipoId = equipoData.Id ?? equipoData.id

    
const { data, error } = await supabase
  .from('JUGADORES')
  .select('*')
  .eq('equipo_id', equipoId)
  .order('id')

if (error) {
  console.error('Error cargando jugadores:', error.message, error.details, error.hint)
  alert(error.message)
  return
}

setJugadores((listas) =>
  listas.map((lista, indice) =>
    indice === equipoSeleccionado
      ? data.filter((jugador) => jugador.activo === true)
      : lista
  )
)

setJugadoresDesactivados((listas) =>
  listas.map((lista, indice) =>
    indice === equipoSeleccionado
      ? data.filter((jugador) => jugador.activo === false)
      : lista
  )
)

  }

  cargarJugadores()
}, [equipoSeleccionado, equipos])

  useEffect(() => {
    if (pantalla !== 'programador' || sesionActiva) return

    const canvas = canvasMatrix.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const caracteres = '01アイウエオカキクケコサシスセソタチツテト'
    let columnas = []
    let ancho = 0
    let alto = 0
    let animacion

    const preparar = () => {
      const escala = window.devicePixelRatio || 1
      ancho = canvas.clientWidth
      alto = canvas.clientHeight
      canvas.width = ancho * escala
      canvas.height = alto * escala
      ctx.setTransform(escala, 0, 0, escala, 0, 0)

      columnas = Array.from(
        { length: Math.ceil(ancho / 18) },
        () => Math.random() * -40
      )
    }

    preparar()

    const dibujar = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)'
      ctx.fillRect(0, 0, ancho, alto)
      ctx.font = '16px monospace'

      columnas.forEach((y, i) => {
        const letra = caracteres[Math.floor(Math.random() * caracteres.length)]
        ctx.fillStyle = '#00ff66'
        ctx.fillText(letra, i * 18, y * 18)

        if (y * 18 > alto && Math.random() > 0.975) {
          columnas[i] = 0
        } else {
          columnas[i] += 0.45 + Math.random() * 0.35
        }
      })

      animacion = requestAnimationFrame(dibujar)
    }

    dibujar()
    window.addEventListener('resize', preparar)

    return () => {
      cancelAnimationFrame(animacion)
      window.removeEventListener('resize', preparar)
    }
  }, [pantalla, sesionActiva])

useEffect(() => {
    if (!partidosCargados) return
  const guardarPartidos = async () => {
    const { data: equiposData, error: errorEquipos } = await supabase
      .from('EQUIPOS')
      .select('*')

    if (errorEquipos) {
      console.error('Error cargando equipos:', errorEquipos)
      return
    }

    const partidosParaGuardar = calendario.flatMap((jornada) =>
      jornada.partidos.map((partido, indice) => {
        const local = equiposData.find(
          (e) => e.Nombre === partido.local
        )

        const visitante = equiposData.find(
          (e) => e.Nombre === partido.visitante
        )

        if (!local || !visitante) return null

        
return {
  jornada: jornada.jornada,
  numero_partido: indice + 1,
  equipo_local_id: local.Id ?? local.id,
  equipo_visitante_id: visitante.Id ?? visitante.id,
  fecha_partido: jornada.fecha || null,
  hora_partido: partido.hora || null
}

      }).filter(Boolean)
    )

    if (partidosParaGuardar.length > 0) {
  const { error } = await supabase
    .from('PARTIDOS')
    .upsert(partidosParaGuardar, {
      onConflict: 'jornada,numero_partido'
    })

  if (error) {
    console.error('Error guardando partidos:', error)
    return
  }
}

}
  guardarPartidos()
}, [calendario, partidosCargados])


const guardarResultado = async () => {
  if (!partidoSeleccionado) {
    setResultadoMensaje('Selecciona un partido')
    return
  }

  const marcadorLocal = Number(golesLocal)
  const marcadorVisitante = Number(golesVisitante)

  if (
    !Number.isInteger(marcadorLocal) ||
    !Number.isInteger(marcadorVisitante) ||
    marcadorLocal < 0 ||
    marcadorVisitante < 0
  ) {
    setResultadoMensaje('El marcador no es válido')
    return
  }

  setGuardandoResultado(true)
  setResultadoMensaje('')

  const { error } = await supabase
    .from('PARTIDOS')
    .update({
      goles_local: marcadorLocal,
      goles_visitante: marcadorVisitante
    })
    .eq('id', partidoSeleccionado)

  if (error) {
    console.error('Error guardando resultado:', error)
    setResultadoMensaje('Error al guardar el resultado')
    setGuardandoResultado(false)
    return
  }

  setPartidosBD((anteriores) =>
    anteriores.map((partido) =>
      String(partido.id) === String(partidoSeleccionado)
        ? {
            ...partido,
            goles_local: marcadorLocal,
            goles_visitante: marcadorVisitante
          }
        : partido
    )
  )

  setPartidoSeleccionado('')
  setEquipoLocalSeleccionado('')
  setEquipoVisitanteSeleccionado('')
  setGolesLocal('')
  setGolesVisitante('')
  setEditandoResultado(false)
  setResultadoMensaje('Resultado guardado correctamente')

  setGuardandoResultado(false)
}

  const abrirPantalla = (destino) => {
  setPantalla(destino)
  setClave('')
  setMensaje('')
  setSesionActiva(false)
  setErrorAcceso(false)
}

  return (
    <div className="app">
      <header className="header">
        <div className="logo">⚽ PELOTEROS <span>SIN VAR</span></div>
        <div className="temporada">TEMPORADA 2026</div>
      </header>

      <main className="contenido">
                
        <section className="bienvenida portada-principal">
  <img
    src={portada}
    alt="Peloteros sin VAR - La copa que todos quieren alcanzar"
  />
</section>

        <section className="accesos">
  <h2>🔐 ACCESOS DEL CAMPEONATO</h2>

  <button onClick={() => abrirPantalla('publico')}>
    👁️ PÚBLICO
  </button>

  <button onClick={() => abrirPantalla('moderador')}>
    🛡️ MODERADOR
  </button>

  <button onClick={() => abrirPantalla('programador')}>
    💻 PROGRAMADOR
  </button>
</section>

{pantalla !== 'inicio' && (
  <section className={`panel-acceso ${pantalla === 'programador' ? 'panel-programador' : pantalla === 'publico' ? 'panel-publico' : 'panel-moderador'}`}>
    {pantalla === 'programador' && !sesionActiva && (
  <canvas
    ref={canvasMatrix}
    className="matrix-canvas"
  />
)}
    <h2>
  {pantalla === 'publico'
    ? '👁️ PÚBLICO'
    : pantalla === 'programador'
      ? '💻 PROGRAMADOR'
      : '🛡️ MODERADOR'}
</h2>

    {!sesionActiva && pantalla !== 'publico' && (
      <>
        <p>IDENTIFICACIÓN REQUERIDA</p>

        <input
          type="password"
          placeholder="Introduce tu clave"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
        />

        <button onClick={async () => {
  const correo = pantalla === 'programador'
    ? 'kuyatec@gmail.com'
    : 'lavadoparedespaul438@gmail.com'

  setMensaje('Verificando acceso...')
  setErrorAcceso(false)

  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: clave
  })

  if (error) {
    setSesionActiva(false)
    setMensaje('Correo o contraseña incorrectos.')
    setErrorAcceso(true)
    return
  }

  setSesionActiva(true)
  setErrorAcceso(false)
  setMensaje('')
  setClave('')
}}>
  INGRESAR
</button>
{errorAcceso && pantalla === 'programador' && (
  <div className="alerta-intruso">
    <h1>💀</h1>
    <h2>¡ACCESO DENEGADO!</h2>
    <p>IDENTIFICACIÓN FALLIDA</p>
    <h3>📸 ¡HEMOS TOMADO UNA FOTOGRAFÍA DEL INTRUSO!</h3>
    <p>EL INCIDENTE HA SIDO REGISTRADO</p>

    <button onClick={() => {
      setErrorAcceso(false)
      setClave('')
    }}>
      VOLVER A INTENTAR
    </button>
  </div>
)}

        {mensaje && <p>{mensaje}</p>}

        <button onClick={() => abrirPantalla('inicio')}>
          ← VOLVER AL CAMPEONATO
        </button>
      </>
    )}

    {sesionActiva && (
      <div className="centro-control">
  <h2>🖥️ CENTRO DE CONTROL</h2>

  <h3>
    {pantalla === 'programador' ? 'PROGRAMADOR' : 'MODERADOR'}
  </h3>

  <p>BIENVENIDO AL SISTEMA DE PELOTEROS SIN VAR</p>

<button onClick={() => {
  setSesionActiva(false)
  setMensaje('')
  setErrorAcceso(false)
  setPantalla('')
}}>
  🏠 VOLVER AL INICIO
</button>
  <div className="menu-administracion">
    <button onClick={() => setMensaje('EQUIPOS Y JUGADORES')}>
      ⚽ EQUIPOS Y JUGADORES
    </button>

    <button onClick={() => setMensaje('CALENDARIO Y JORNADAS')}>
      📅 CALENDARIO Y JORNADAS
    </button>

    <button onClick={() => setMensaje('RESULTADOS')}>
      📝 RESULTADOS
    </button>

    <button onClick={() => setMensaje('GOLEADORES Y TARJETAS')}>
      🏆 GOLEADORES Y TARJETAS
    </button>

    {pantalla === 'programador' && (
      <button onClick={() => setMensaje('GESTIÓN DE ACCESOS')}>
        🔐 GESTIÓN DE ACCESOS
      </button>
    )}
        </div>

  {mensaje && (
    <button onClick={() => setMensaje('')}>
      ← VOLVER AL CENTRO DE CONTROL
    </button>
  )}

  {mensaje === 'RESULTADOS' && (
    <div className="editor-equipos">
      <h3>📝 REGISTRAR RESULTADOS</h3>

      <label>SELECCIONAR PARTIDO</label>

      <select
        value={partidoSeleccionado}
        onChange={(e) => {
          const id = e.target.value
          setPartidoSeleccionado(id)

          setEditandoResultado(false)
setResultadoMensaje('')

          const partido = partidosBD.find(
            (p) => String(p.id) === id
          )

          if (partido) {
            const local = equiposBD.find(
              (eq) => String(eq.Id ?? eq.id) === String(partido.equipo_local_id)
            )

            const visitante = equiposBD.find(
              (eq) => String(eq.Id ?? eq.id) === String(partido.equipo_visitante_id)
            )

            setEquipoLocalSeleccionado(local?.Nombre ?? '')
            setEquipoVisitanteSeleccionado(visitante?.Nombre ?? '')
            setGolesLocal(partido.goles_local ?? '')
            setGolesVisitante(partido.goles_visitante ?? '')
          }
        }}
      >
        <option value="">-- Selecciona un partido --</option>

        {partidosBD.map((partido) => {
          const local = equiposBD.find(
            (eq) => String(eq.Id ?? eq.id) === String(partido.equipo_local_id)
          )

          const visitante = equiposBD.find(
            (eq) => String(eq.Id ?? eq.id) === String(partido.equipo_visitante_id)
          )

          return (
            <option key={partido.id} value={String(partido.id)}>
              Jornada {partido.jornada}: {local?.Nombre ?? 'Local'} vs {visitante?.Nombre ?? 'Visitante'}
            </option>
          )
        })}
      </select>

      
{partidoSeleccionado && (() => {
  const partidoActual = partidosBD.find(
    (p) => String(p.id) === String(partidoSeleccionado)
  )

  const tieneResultado =
    partidoActual?.goles_local != null &&
    partidoActual?.goles_visitante != null

  const bloqueado = tieneResultado && !editandoResultado

  return (
    <>
      <h3>
        {equipoLocalSeleccionado} vs {equipoVisitanteSeleccionado}
      </h3>

      <label>{equipoLocalSeleccionado}</label>
      <input
        type="number"
        min="0"
        value={golesLocal}
        disabled={bloqueado}
        onChange={(e) => setGolesLocal(e.target.value)}
      />

      <label>{equipoVisitanteSeleccionado}</label>
      <input
        type="number"
        min="0"
        value={golesVisitante}
        disabled={bloqueado}
        onChange={(e) => setGolesVisitante(e.target.value)}
      />

      {bloqueado ? (
        <button onClick={() => setEditandoResultado(true)}>
          ✏️ EDITAR RESULTADO
        </button>
      ) : (
        <button
          onClick={guardarResultado}
          disabled={guardandoResultado}
        >
          {guardandoResultado
            ? 'GUARDANDO...'
            : editandoResultado
              ? '🔄 ACTUALIZAR RESULTADO'
              : '💾 GUARDAR RESULTADO'}
        </button>
      )}

      <p>{resultadoMensaje}</p>
    </>
  )
})()}

    </div>
  )}

  {mensaje === 'EQUIPOS Y JUGADORES' && (
    <div className="editor-equipos">
      <h3>⚽ ADMINISTRAR EQUIPOS</h3>

      {equipos.map((equipo, indice) => (
  <div key={indice}>
    {equipoEditando === indice ? (
      <>
        <input
          value={nombreEditado}
          onChange={(e) => setNombreEditado(e.target.value)}
        />

        <button onClick={() => {
          const nombre = nombreEditado.trim().toUpperCase()

          if (!nombre || equipos.some((e, i) => e === nombre && i !== indice)) return

          setEquipos(equipos.map((e, i) =>
            i === indice ? nombre : e
          ))

          setEquipoEditando(null)
          setNombreEditado('')
        }}>
          GUARDAR
        </button>

        <button onClick={() => {
          setEquipoEditando(null)
          setNombreEditado('')
        }}>
          CANCELAR
        </button>
      </>
    ) : (
      <>
        <p>{indice + 1}. {equipo}</p>

        <button onClick={() => {
          setEquipoEditando(indice)
          setNombreEditado(equipo)
        }}>
          EDITAR
        </button>
        <button onClick={() => {
  console.log('Equipo seleccionado:', indice)
  setEquipoSeleccionado(indice)
  setNuevoJugadorNombre('')
}}>
  VER JUGADORES
</button>
      </>
    )}
  </div>
))}

<p style={{color: 'yellow', fontSize: '20px'}}>
  EQUIPO SELECCIONADO: {equipoSeleccionado}
</p>

{equipoSeleccionado !== null && (
  <div className="ficha-jugadores">
    <h3>⚽ JUGADORES: {equipos[equipoSeleccionado]}</h3>

    <input
      type="text"
      placeholder="Nombre del jugador"
      value={nuevoJugadorNombre}
      onChange={(e) => setNuevoJugadorNombre(e.target.value)}
    />

    
<button onClick={async () => {
  const nombre = nuevoJugadorNombre.trim().toUpperCase()

  if (!nombre) return

  const { data: equipoData, error: errorEquipo } = await supabase
    .from('EQUIPOS')
    .select('*')
    .eq('Nombre', equipos[equipoSeleccionado])
    .single()

  if (errorEquipo) {
    console.error('Error buscando equipo:', errorEquipo)
    alert('No se pudo encontrar el equipo')
    return
  }

  const equipoId = equipoData.Id ?? equipoData.id

  
const { data: jugadorGuardado, error: errorJugador } = await supabase
  .from('JUGADORES')
  .insert({
    NOMBRE: nombre,
    equipo_id: equipoId,
    activo: true
  })
  .select()
  .single()

if (errorJugador) {
  console.error('Error guardando jugador:', errorJugador)
  alert('No se pudo guardar el jugador')
  return
}


setJugadores((listas) =>
  listas.map((lista, indice) =>
    indice === equipoSeleccionado
      ? [...lista, jugadorGuardado]
      : lista
  )
)



  setNuevoJugadorNombre('')
  alert('¡Jugador guardado correctamente!')
}}>
  AGREGAR JUGADOR
</button>


    

{jugadores[equipoSeleccionado].map((jugador, indice) => (
  <div key={jugador.id}>
    <span>{indice + 1}. {jugador.NOMBRE}</span>

    <button onClick={async () => {
      const { error } = await supabase
        .from('JUGADORES')
        .update({ activo: false })
        .eq('id', jugador.id)

      if (error) {
        alert('Error al desactivar jugador: ' + error.message)
        return
      }

      setJugadores((listas) =>
        listas.map((lista, equipoIndice) =>
          equipoIndice === equipoSeleccionado
            ? lista.filter((j) => j.id !== jugador.id)
            : lista
        )
      )

      setJugadoresDesactivados((listas) =>
        listas.map((lista, equipoIndice) =>
          equipoIndice === equipoSeleccionado
            ? [...lista, { ...jugador, activo: false }]
            : lista
        )
      )

      alert('Jugador desactivado correctamente')
    }}>
      DESACTIVAR
    </button>

    <button onClick={async () => {
      const confirmar = window.confirm(
        '¿Estás seguro de eliminar definitivamente a ' +
        jugador.NOMBRE + '? Esta acción no se puede deshacer.'
      )

      if (!confirmar) return

      const { error } = await supabase
        .from('JUGADORES')
        .delete()
        .eq('id', jugador.id)

      if (error) {
        alert('Error al eliminar jugador: ' + error.message)
        return
      }

      setJugadores((listas) =>
        listas.map((lista, equipoIndice) =>
          equipoIndice === equipoSeleccionado
            ? lista.filter((j) => j.id !== jugador.id)
            : lista
        )
      )

      alert('Jugador eliminado definitivamente')
    }}>
      ELIMINAR
    </button>
  </div>
))}

<h3>JUGADORES DESACTIVADOS</h3>

{jugadoresDesactivados[equipoSeleccionado].map((jugador, indice) => (
  <div key={jugador.id}>
    <span>{indice + 1}. {jugador.NOMBRE} (DESACTIVADO)</span>

    <button onClick={async () => {
      const { error } = await supabase
        .from('JUGADORES')
        .update({ activo: true })
        .eq('id', jugador.id)

      if (error) {
        alert('Error al reactivar jugador: ' + error.message)
        return
      }

      setJugadoresDesactivados((listas) =>
        listas.map((lista, equipoIndice) =>
          equipoIndice === equipoSeleccionado
            ? lista.filter((j) => j.id !== jugador.id)
            : lista
        )
      )

      setJugadores((listas) =>
        listas.map((lista, equipoIndice) =>
          equipoIndice === equipoSeleccionado
            ? [...lista, { ...jugador, activo: true }]
            : lista
        )
      )

      alert('¡Jugador reactivado correctamente!')
    }}>
      REACTIVAR
    </button>
  </div>
))}



    <button onClick={() => setEquipoSeleccionado(null)}>
      CERRAR JUGADORES
    </button>
  </div>
)}
      <input
        type="text"
        placeholder="Nombre del sexto equipo"
        value={nuevoEquipo}
        onChange={(e) => setNuevoEquipo(e.target.value)}
      />

      <button onClick={() => {
        const nombre = nuevoEquipo.trim().toUpperCase()

        if (!nombre || equipos.includes(nombre)) return

        setEquipos(equipos.map((equipo) =>
          equipo === 'POR DEFINIR' ? nombre : equipo
        ))

        setNuevoEquipo('')
      }}>
        AGREGAR SEXTO EQUIPO
      </button>
    </div>
    )}

  
  

{mensaje === 'CALENDARIO Y JORNADAS' && (
  <div className="editor-equipos">
    <h3>📅 CALENDARIO Y JORNADAS</h3>
    <p>PROGRAMACIÓN DEL CAMPEONATO</p>

    {calendario.map((jornada, indice) => {
      const equiposQueJuegan = jornada.partidos.flatMap(
        partido => [partido.local, partido.visitante]
      ).filter(Boolean)

      const equiposQueDescansan = equipos.filter(
        equipo =>
          equipo !== 'POR DEFINIR' &&
          !equiposQueJuegan.includes(equipo)
      )

      const tienePartidosGuardados = partidosBD.some(
        partido => Number(partido.jornada) === Number(jornada.jornada)
      )

      const tieneEquiposAsignados = jornada.partidos.some(
        partido => partido.local || partido.visitante
      )

      const puedeEliminar =
        indice === calendario.length - 1 &&
        !tienePartidosGuardados &&
        !tieneEquiposAsignados
        const jornadaBloqueada = jornadasConfirmadas.includes(Number(jornada.jornada))

      return (
        <div key={jornada.jornada}>
          <h3>JORNADA {jornada.jornada}</h3>

{jornadaBloqueada ? (
  <button
    onClick={async () => {
      const { error } = await supabase
        .from('jornadas')
        .upsert({
          jornada: jornada.jornada,
          confirmada: false
        }, { onConflict: 'jornada' })

      if (error) {
        console.error('Error habilitando jornada:', error)
        alert('No se pudo habilitar la edición')
        return
      }

      setJornadasConfirmadas(anterior =>
        anterior.filter(n => n !== Number(jornada.jornada))
      )
    }}
  >
    ✏️ EDITAR PROGRAMACIÓN
  </button>
) : (
  <button
    
onClick={async () => {
  const { data: equiposData, error: errorEquipos } = await supabase
    .from('EQUIPOS')
    .select('*')

  if (errorEquipos) {
    console.error('Error cargando equipos:', errorEquipos)
    alert('No se pudieron cargar los equipos')
    return
  }

  const partidosParaGuardar = jornada.partidos
    .map((partido, indice) => {
      const local = equiposData.find(e => e.Nombre === partido.local)
      const visitante = equiposData.find(e => e.Nombre === partido.visitante)

      if (!local || !visitante) return null

      return {
        jornada: jornada.jornada,
        numero_partido: indice + 1,
        equipo_local_id: local.Id ?? local.id,
        equipo_visitante_id: visitante.Id ?? visitante.id,
        fecha_partido: jornada.fecha || null,
        hora_partido: partido.hora || null
      }
    })
    .filter(Boolean)

  if (partidosParaGuardar.length > 0) {
    const { error: errorPartidos } = await supabase
      .from('PARTIDOS')
      .upsert(partidosParaGuardar, {
        onConflict: 'jornada,numero_partido'
      })

    if (errorPartidos) {
      console.error('Error guardando partidos:', errorPartidos)
      alert('No se pudieron guardar los enfrentamientos')
      return
    }
  }

  const { error } = await supabase
    .from('jornadas')
    .upsert({
      jornada: jornada.jornada,
      confirmada: true
    }, { onConflict: 'jornada' })

  if (error) {
    console.error('Error confirmando jornada:', error)
    alert('No se pudo confirmar la programación')
    return
  }

  setJornadasConfirmadas(anterior =>
    anterior.includes(Number(jornada.jornada))
      ? anterior
      : [...anterior, Number(jornada.jornada)]
  )

  alert('¡Programación guardada correctamente!')
}}

  >
    💾 GUARDAR PROGRAMACIÓN
  </button>
)}
          <label>📅 FECHA DE LA JORNADA</label>
          <input
            type="date"
            disabled={jornadaBloqueada}
            value={jornada.fecha || ''}
            onChange={(e) => {
              const nuevoCalendario = calendario.map((j, i) =>
                i === indice
                  ? { ...j, fecha: e.target.value }
                  : j
              )
              setCalendario(nuevoCalendario)
            }}
          />

          {jornada.partidos.map((partido, partidoIndice) => (
            <div key={partidoIndice}>
              <h4>ENFRENTAMIENTO {partidoIndice + 1}</h4>

              <select
              disabled={jornadaBloqueada}
                value={partido.local}
                onChange={(e) => {
                  const nuevoCalendario = [...calendario]
                  nuevoCalendario[indice] = {
                    ...jornada,
                    partidos: jornada.partidos.map((p, i) =>
                      i === partidoIndice
                        ? { ...p, local: e.target.value }
                        : p
                    )
                  }
                  setCalendario(nuevoCalendario)
                }}
              >
                <option value="">LOCAL</option>
                {equipos.filter(e => e !== 'POR DEFINIR').map(equipo => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>

              <span> VS </span>

              <select
              disabled={jornadaBloqueada}
                value={partido.visitante}
                onChange={(e) => {
                  const nuevoCalendario = [...calendario]
                  nuevoCalendario[indice] = {
                    ...jornada,
                    partidos: jornada.partidos.map((p, i) =>
                      i === partidoIndice
                        ? { ...p, visitante: e.target.value }
                        : p
                    )
                  }
                  setCalendario(nuevoCalendario)
                }}
              >
                <option value="">VISITANTE</option>
                {equipos.filter(e => e !== 'POR DEFINIR').map(equipo => (
                  <option key={equipo} value={equipo}>{equipo}</option>
                ))}
              </select>

              <label>🕒 HORA DEL PARTIDO</label>
              <input
                type="time"
                disabled={jornadaBloqueada}
                value={partido.hora || ''}
                onChange={(e) => {
                  const nuevoCalendario = [...calendario]
                  nuevoCalendario[indice] = {
                    ...jornada,
                    partidos: jornada.partidos.map((p, i) =>
                      i === partidoIndice
                        ? { ...p, hora: e.target.value }
                        : p
                    )
                  }
                  setCalendario(nuevoCalendario)
                }}
              />

              <button
  disabled={jornadaBloqueada}
  onClick={() => {
                  const nuevoCalendario = [...calendario]
                  nuevoCalendario[indice] = {
                    ...jornada,
                    partidos: jornada.partidos.filter(
                      (_, i) => i !== partidoIndice
                    )
                  }
                  setCalendario(nuevoCalendario)
                }}
              >
                ELIMINAR ENFRENTAMIENTO
              </button>
            </div>
          ))}

          <button
          disabled={jornadaBloqueada}
            onClick={() => {
              const nuevoCalendario = [...calendario]
              nuevoCalendario[indice] = {
                ...jornada,
                partidos: [
                  ...jornada.partidos,
                  { local: '', visitante: '', hora: '' }
                ]
              }
              setCalendario(nuevoCalendario)
            }}
          >
            + AGREGAR ENFRENTAMIENTO
          </button>

          <h4>😴 EQUIPOS QUE DESCANSAN</h4>
          {equiposQueDescansan.length > 0
            ? equiposQueDescansan.map(equipo => (
                <p key={equipo}>⚽ {equipo}</p>
              ))
            : <p>Ningún equipo descansa</p>
          }

          {puedeEliminar && (
            <button
            disabled={jornadaBloqueada}
              onClick={() => {
                setCalendario(anterior =>
                  anterior.filter((_, i) => i !== indice)
                )
              }}
            >
              🗑️ ELIMINAR ESTA JORNADA
            </button>
          )}
        </div>
      )
    })}

    <button
      onClick={() => {
        setCalendario(anterior => [
          ...anterior,
          {
            jornada: anterior.length + 1,
            fecha: '',
            partidos: [
              { local: '', visitante: '', hora: '' },
              { local: '', visitante: '', hora: '' }
            ]
          }
        ])
      }}
    >
      ➕ AGREGAR NUEVA JORNADA
    </button>
  </div>
)}
      </div>
    )}

{(pantalla === 'publico' || sesionActiva) && (
  <>
    <section className="clasificacion">
  <h2>🏆 Tabla de posiciones</h2>
  <p className="subtitulo">CLASIFICACIÓN GENERAL</p>

  <div className="tabla">
    <div className="fila encabezado">
      <span>POS</span>
      <span>EQUIPO</span>
      <span>PJ</span>
      <span>PG</span>
      <span>PE</span>
      <span>PP</span>
      <span>GF</span>
      <span>GC</span>
      <span>DG</span>
      <span>PTS</span>
    </div>

    {(() => {
      const tabla = equipos
        .filter(equipo => equipo !== 'POR DEFINIR')
        .map(equipo => {
          const equipoBD = equiposBD.find(
            eq => eq.Nombre === equipo
          )

          const equipoId = equipoBD?.Id ?? equipoBD?.id

          const estadisticas = {
            equipo,
            pj: 0,
            pg: 0,
            pe: 0,
            pp: 0,
            gf: 0,
            gc: 0,
            dg: 0,
            pts: 0
          }

          partidosBD.forEach(partido => {
            if (
              partido.goles_local == null ||
              partido.goles_visitante == null
            ) return

            const esLocal =
              String(partido.equipo_local_id) === String(equipoId)

            const esVisitante =
              String(partido.equipo_visitante_id) === String(equipoId)

            if (!esLocal && !esVisitante) return

            const golesPropios = Number(
              esLocal
                ? partido.goles_local
                : partido.goles_visitante
            )

            const golesRival = Number(
              esLocal
                ? partido.goles_visitante
                : partido.goles_local
            )

            estadisticas.pj++
            estadisticas.gf += golesPropios
            estadisticas.gc += golesRival

            if (golesPropios > golesRival) {
              estadisticas.pg++
              estadisticas.pts += 3
            } else if (golesPropios === golesRival) {
              estadisticas.pe++
              estadisticas.pts += 1
            } else {
              estadisticas.pp++
            }
          })

          estadisticas.dg =
            estadisticas.gf - estadisticas.gc

          return estadisticas
        })
        .sort((a, b) =>
          b.pts - a.pts ||
          b.dg - a.dg ||
          b.gf - a.gf
        )

      return tabla.map((equipo, indice) => (
        <div className="fila" key={equipo.equipo}>
          <span>{indice + 1}</span>
          <strong>{equipo.equipo}</strong>
          <span>{equipo.pj}</span>
          <span>{equipo.pg}</span>
          <span>{equipo.pe}</span>
          <span>{equipo.pp}</span>
          <span>{equipo.gf}</span>
          <span>{equipo.gc}</span>
          <span>{equipo.dg}</span>
          <strong>{equipo.pts}</strong>
        </div>
      ))
    })()}
  </div>
</section>


       


<section className="jornada">
  <h2>📅 Calendario del campeonato</h2>
  <p className="subtitulo">PROGRAMACIÓN DE JORNADAS</p>

  {calendario.map((jornada) => {
    const equiposQueJuegan = jornada.partidos.flatMap(
      partido => [partido.local, partido.visitante]
    ).filter(Boolean)

    const equiposQueDescansan = equipos.filter(
      equipo =>
        equipo !== 'POR DEFINIR' &&
        !equiposQueJuegan.includes(equipo)
    )

    const jornadaConfirmada = jornadasConfirmadas.includes(
  Number(jornada.jornada)
)

    return (
      <div className="jornada-bloque" key={jornada.jornada}>
        
<h3>JORNADA {jornada.jornada}</h3>

{jornadaConfirmada ? (
  <>
    {jornada.partidos.length > 0 ? (
      jornada.partidos.map((partido, indice) => (
        <div className="partido" key={indice}>
          <strong>ENFRENTAMIENTO {indice + 1}</strong>

          <span>
            {partido.local || 'POR DEFINIR'} vs {partido.visitante || 'POR DEFINIR'}
          </span>

          <span>
            📅 {jornada.fecha
              ? new Date(jornada.fecha + 'T12:00:00').toLocaleDateString('es-PE')
              : 'FECHA POR DEFINIR'}
          </span>

          <span>
            🕒 {partido.hora || 'HORA POR DEFINIR'}
          </span>
        </div>
      ))
    ) : (
      <p className="descanso">Sin enfrentamientos programados</p>
    )}

    <p className="descanso">
      {equiposQueDescansan.length > 0
        ? `DESCANSAN: ${equiposQueDescansan.join(' y ')}`
        : 'NINGÚN EQUIPO DESCANSA'}
    </p>
  </>
) : (
  <p className="descanso">🔒 PROGRAMACIÓN POR CONFIRMAR</p>
)}

      </div>
    )
    })}
</section>
  </>
)}

{sesionActiva && (
  <section className="estadisticas">
    <h2>⭐ Estadísticas del campeonato</h2>
    <div className="estadistica">
      <span>🥇 Goleador</span>
      <strong>Por definir</strong>
    </div>
    <div className="estadistica">
      <span>🟨 Tarjetas amarillas</span>
      <strong>0</strong>
    </div>
    <div className="estadistica">
      <span>🟥 Tarjetas rojas</span>
      <strong>0</strong>
    </div>
  </section>
)}
  </section>
)}

      </main>

      <footer>
        PELOTEROS SIN VAR · TODOS SOMOS PARTE DEL CAMPEONATO
      </footer>
    </div>
  )
}

export default App
