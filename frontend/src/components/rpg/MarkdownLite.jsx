import React from 'react';

/**
 * Renderiza un subconjunto de Markdown a nodos de React.
 *
 * Por qué existe: el Sabio Alquimista responde en Markdown (`**negrita**`,
 * `###`, `---`, listas). Antes se pintaba como texto plano y el alumno veía
 * los asteriscos. No usamos `dangerouslySetInnerHTML` ni una librería: el
 * texto viene de un modelo, así que se construyen nodos, nunca HTML.
 *
 * Soporta: párrafos, #/##/###/####, listas (-, *, •, 1.), ---, > cita,
 * `código`, **negrita**, *cursiva*.
 */

const INLINE_RE = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`]+`)/g;

function inline(texto, clave) {
  const partes = texto.split(INLINE_RE).filter((p) => p !== '');
  return partes.map((parte, i) => {
    const k = `${clave}-${i}`;
    if (/^\*\*[\s\S]+\*\*$/.test(parte) || /^__[\s\S]+__$/.test(parte)) {
      return <strong key={k}>{parte.slice(2, -2)}</strong>;
    }
    if (/^\*[\s\S]+\*$/.test(parte) || /^_[\s\S]+_$/.test(parte)) {
      return <em key={k}>{parte.slice(1, -1)}</em>;
    }
    if (/^`[\s\S]+`$/.test(parte)) {
      return <code key={k}>{parte.slice(1, -1)}</code>;
    }
    return <React.Fragment key={k}>{parte}</React.Fragment>;
  });
}

export default function MarkdownLite({ children, className = '' }) {
  const texto = typeof children === 'string' ? children : String(children ?? '');
  if (!texto.trim()) return null;

  const lineas = texto.replace(/\r\n/g, '\n').split('\n');
  const bloques = [];
  let parrafo = [];
  let lista = null; // { ordenada: bool, items: string[] }
  let clave = 0;

  const cerrarParrafo = () => {
    if (!parrafo.length) return;
    const k = `p${clave++}`;
    bloques.push(<p key={k}>{inline(parrafo.join(' '), k)}</p>);
    parrafo = [];
  };

  const cerrarLista = () => {
    if (!lista) return;
    const k = `l${clave++}`;
    const items = lista.items.map((t, i) => <li key={`${k}-${i}`}>{inline(t, `${k}-${i}`)}</li>);
    bloques.push(lista.ordenada ? <ol key={k}>{items}</ol> : <ul key={k}>{items}</ul>);
    lista = null;
  };

  const cerrarTodo = () => {
    cerrarParrafo();
    cerrarLista();
  };

  for (const linea of lineas) {
    const t = linea.trim();

    if (!t) {
      cerrarTodo();
      continue;
    }

    // Separador horizontal
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) {
      cerrarTodo();
      bloques.push(<hr key={`h${clave++}`} />);
      continue;
    }

    // Encabezados
    const enc = t.match(/^(#{1,6})\s+(.*)$/);
    if (enc) {
      cerrarTodo();
      const nivel = Math.min(enc[1].length + 2, 6); // # -> h3, ## -> h4...
      const Etiqueta = `h${nivel}`;
      const k = `t${clave++}`;
      bloques.push(<Etiqueta key={k}>{inline(enc[2], k)}</Etiqueta>);
      continue;
    }

    // Cita
    if (/^>\s?/.test(t)) {
      cerrarTodo();
      const k = `q${clave++}`;
      bloques.push(<blockquote key={k}>{inline(t.replace(/^>\s?/, ''), k)}</blockquote>);
      continue;
    }

    // Lista con viñeta
    const vineta = t.match(/^[-*•]\s+(.*)$/);
    if (vineta) {
      cerrarParrafo();
      if (!lista || lista.ordenada) { cerrarLista(); lista = { ordenada: false, items: [] }; }
      lista.items.push(vineta[1]);
      continue;
    }

    // Lista numerada
    const numerada = t.match(/^\d+[.)]\s+(.*)$/);
    if (numerada) {
      cerrarParrafo();
      if (!lista || !lista.ordenada) { cerrarLista(); lista = { ordenada: true, items: [] }; }
      lista.items.push(numerada[1]);
      continue;
    }

    // Texto normal: se acumula en el párrafo actual
    cerrarLista();
    parrafo.push(t);
  }

  cerrarTodo();

  return <div className={`md-lite ${className}`.trim()}>{bloques}</div>;
}
