import React, { useEffect, useMemo, useRef, useState } from "react";

const LS_KEY = "todo_pwa_v1";

// Estados permitidos
const STATUS = {
  PENDING: "PENDIENTE",
  IN_PROGRESS: "EN_PROCESO",
  DONE: "TERMINADO"
};

function nowISO() {
  return new Date().toISOString();
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString();
}

function uid() {
  // crypto.randomUUID no siempre está en todos lados, así que fallback
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState(STATUS.PENDING);

  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // ===== Botón instalar (PWA) =====
  const [canInstall, setCanInstall] = useState(false);
  const deferredPromptRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      deferredPromptRef.current = e;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setCanInstall(false);
      deferredPromptRef.current = null;
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    const dp = deferredPromptRef.current;
    if (!dp) return;
    dp.prompt();
    await dp.userChoice;
    deferredPromptRef.current = null;
    setCanInstall(false);
  }

  // ===== Persistencia =====
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  // ===== Contadores =====
  const counters = useMemo(() => {
    const c = { PENDIENTE: 0, EN_PROCESO: 0, TERMINADO: 0 };
    for (const t of tasks) c[t.status] = (c[t.status] || 0) + 1;
    return c;
  }, [tasks]);

  // ===== CRUD =====
  function addTask() {
    const t = title.trim();
    const d = desc.trim();

    if (!t) return;

    const createdAt = nowISO();
    const newTask = {
      id: uid(),
      title: t,
      description: d,
      status,
      createdAt,
      completedAt: status === STATUS.DONE ? createdAt : null
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDesc("");
    setStatus(STATUS.PENDING);
  }

  function updateStatus(id, newStatus) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        // si pasa a TERMINADO y no tenía completedAt, se asigna
        if (newStatus === STATUS.DONE) {
          return { ...t, status: newStatus, completedAt: t.completedAt ?? nowISO() };
        }

        // si se regresa de TERMINADO a otro estado, quitamos completedAt (o lo puedes conservar si prefieres)
        return { ...t, status: newStatus, completedAt: null };
      })
    );
  }

  function toggleDone(id) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        if (t.status === STATUS.DONE) {
          // Si estaba terminado, lo regresamos a pendiente
          return { ...t, status: STATUS.PENDING, completedAt: null };
        }

        // Si no estaba terminado, lo marcamos terminado
        return { ...t, status: STATUS.DONE, completedAt: nowISO() };
      })
    );
  }

  function removeAll() {
    if (!confirm("¿Seguro que quieres borrar toda la lista?")) return;
    setTasks([]);
  }

  function removeOne(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function badgeClass(st) {
    if (st === STATUS.PENDING) return "badge pending";
    if (st === STATUS.IN_PROGRESS) return "badge progress";
    return "badge done";
  }

  const online = navigator.onLine;

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>To-Do (PWA)</h1>
          <p className="sub">
            Conexión:{" "}
            <span className={online ? "dot on" : "dot off"}>
              {online ? "ONLINE" : "OFFLINE"}
            </span>
          </p>
        </div>

        <div className="actions">
          {canInstall ? (
            <button className="install" onClick={handleInstall}>
              Instalar
            </button>
          ) : (
            <button className="ghost" title="Si no aparece, usa el menú del navegador: Agregar a pantalla principal" disabled>
              Instalar
            </button>
          )}

          <button className="danger" onClick={removeAll}>
            Borrar todo
          </button>
        </div>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Nueva tarea</h2>

          <label className="lbl">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Terminar actividad de PWA"
          />

          <label className="lbl">Descripción</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Ej. Agregar manifest, hacer deploy en Netlify..."
            rows={3}
          />

          <label className="lbl">Estado inicial</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value={STATUS.PENDING}>Pendiente</option>
            <option value={STATUS.IN_PROGRESS}>En proceso</option>
            <option value={STATUS.DONE}>Terminado</option>
          </select>

          <div className="row">
            <button onClick={addTask}>Agregar</button>
            <p className="hint">
              Se guarda en <b>localStorage</b> automáticamente ✅
            </p>
          </div>
        </section>

        <section className="card">
          <h2>Lista</h2>

          <div className="counts">
            <span className="chip">Pendiente: {counters.PENDIENTE || 0}</span>
            <span className="chip">En proceso: {counters.EN_PROCESO || 0}</span>
            <span className="chip">Terminado: {counters.TERMINADO || 0}</span>
          </div>

          {tasks.length === 0 ? (
            <p className="empty">No hay tareas todavía.</p>
          ) : (
            <ul className="list">
              {tasks.map((t) => (
                <li key={t.id} className={`item ${t.status === STATUS.DONE ? "itemDone" : ""}`}>
                  <div className="left">
                    <div className="topline">
                      <strong className="title">{t.title}</strong>
                      <span className={badgeClass(t.status)}>
                        {t.status === STATUS.PENDING
                          ? "Pendiente"
                          : t.status === STATUS.IN_PROGRESS
                          ? "En proceso"
                          : "Terminado"}
                      </span>
                    </div>

                    {t.description ? <p className="desc">{t.description}</p> : null}

                    <div className="meta">
                      <span>Creada: {formatDateTime(t.createdAt)}</span>
                      <span>Terminada: {formatDateTime(t.completedAt)}</span>
                    </div>
                  </div>

                  <div className="right">
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={t.status === STATUS.DONE}
                        onChange={() => toggleDone(t.id)}
                      />
                      <span>✔</span>
                    </label>

                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(t.id, e.target.value)}
                      className="miniSelect"
                    >
                      <option value={STATUS.PENDING}>Pendiente</option>
                      <option value={STATUS.IN_PROGRESS}>En proceso</option>
                      <option value={STATUS.DONE}>Terminado</option>
                    </select>

                    <button className="ghost" onClick={() => removeOne(t.id)}>
                      Borrar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <p className="hint2">
            Si en algún celular no sale el botón, usa el menú del navegador:{" "}
            <b>“Agregar a pantalla principal”</b>.
          </p>
        </section>
      </main>

      <footer className="foot">
        <small>
          React + Vite + Manifest. (Sin Service Worker para evitar problemas en deploy).
        </small>
      </footer>
    </div>
  );
}