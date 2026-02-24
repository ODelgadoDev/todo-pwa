import React, { useEffect, useMemo, useState } from "react";
import { setupInstallButton } from "./install";

type Status = "PENDIENTE" | "EN_PROCESO" | "TERMINADO";

type Task = {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: string;     // ISO
  completedAt: string | null; // ISO o null
};

const LS_KEY = "todo_pwa_tasks_v1";

function nowISO() {
  return new Date().toISOString();
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function uid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function App() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<Status>("PENDIENTE");

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  });

  // instalar (botón)
  useEffect(() => {
    const btn = document.getElementById("installBtn") as HTMLButtonElement | null;
    if (btn) setupInstallButton(btn);
  }, []);

  // persistencia
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const counters = useMemo(() => {
    const c = { PENDIENTE: 0, EN_PROCESO: 0, TERMINADO: 0 };
    for (const t of tasks) c[t.status]++;
    return c;
  }, [tasks]);

  function addTask() {
    const t = title.trim();
    const d = desc.trim();
    if (!t) return;

    const createdAt = nowISO();
    const newTask: Task = {
      id: uid(),
      title: t,
      description: d,
      status,
      createdAt,
      completedAt: status === "TERMINADO" ? createdAt : null
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");
    setDesc("");
    setStatus("PENDIENTE");
  }

  function setTaskStatus(id: string, newStatus: Status) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        if (newStatus === "TERMINADO") {
          return { ...t, status: newStatus, completedAt: t.completedAt ?? nowISO() };
        }
        return { ...t, status: newStatus, completedAt: null };
      })
    );
  }

  function toggleDone(id: string) {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.status === "TERMINADO") {
          return { ...t, status: "PENDIENTE", completedAt: null };
        }
        return { ...t, status: "TERMINADO", completedAt: nowISO() };
      })
    );
  }

  function removeOne(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function clearAll() {
    if (!confirm("¿Seguro que quieres borrar toda la lista?")) return;
    setTasks([]);
  }

  const online = navigator.onLine;

  function badgeClass(st: Status) {
    if (st === "PENDIENTE") return "badge pending";
    if (st === "EN_PROCESO") return "badge progress";
    return "badge done";
  }

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>Todo PWA</h1>
          <p className="sub">
            Conexión:{" "}
            <span className={online ? "dot on" : "dot off"}>
              {online ? "ONLINE" : "OFFLINE"}
            </span>
          </p>
        </div>

        <div className="actions">
          <button id="installBtn" className="install" hidden disabled>
            Instalar
          </button>
          <button className="danger" onClick={clearAll}>
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
            placeholder="Ej. Subir tarea a Netlify"
          />

          <label className="lbl">Descripción</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Detalles…"
            rows={3}
          />

          <label className="lbl">Estado inicial</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="TERMINADO">Terminado</option>
          </select>

          <div className="row">
            <button onClick={addTask}>Agregar</button>
            <p className="hint">Se guarda en localStorage ✅</p>
          </div>
        </section>

        <section className="card">
          <h2>Lista</h2>

          <div className="counts">
            <span className="chip">Pendiente: {counters.PENDIENTE}</span>
            <span className="chip">En proceso: {counters.EN_PROCESO}</span>
            <span className="chip">Terminado: {counters.TERMINADO}</span>
          </div>

          {tasks.length === 0 ? (
            <p className="empty">No hay tareas todavía.</p>
          ) : (
            <ul className="list">
              {tasks.map((t) => (
                <li key={t.id} className={`item ${t.status === "TERMINADO" ? "itemDone" : ""}`}>
                  <div className="left">
                    <div className="topline">
                      <strong className="title">{t.title}</strong>
                      <span className={badgeClass(t.status)}>
                        {t.status === "PENDIENTE"
                          ? "Pendiente"
                          : t.status === "EN_PROCESO"
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
                        checked={t.status === "TERMINADO"}
                        onChange={() => toggleDone(t.id)}
                      />
                      <span>✔</span>
                    </label>

                    <select
                      className="miniSelect"
                      value={t.status}
                      onChange={(e) => setTaskStatus(t.id, e.target.value as Status)}
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="EN_PROCESO">En proceso</option>
                      <option value="TERMINADO">Terminado</option>
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
            Si no aparece “Instalar”, usa el menú del navegador: <b>Agregar a pantalla principal</b>.
          </p>
        </section>
      </main>

      <footer className="foot">
        <small>React + Vite + TypeScript + Manifest + localStorage.</small>
      </footer>
    </div>
  );
}