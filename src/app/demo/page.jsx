"use client";

import { useEffect, useState } from 'react';
import FlashcardGrid from '@/components/FlashcardGrid';
import TableResult from '@/components/TableResult';
import { parseStudyNotes } from '@/lib/demo.mjs';
import './demo.css';

const sample = 'HTTP: A protocol for transferring web resources.\nDNS: Translates domain names into IP addresses.\nCache: Stores reusable data to reduce repeated work.';
const storageKey = 'ctrl-v-portfolio-decks';

export default function PortfolioDemo() {
  const [notes, setNotes] = useState(sample);
  const [cards, setCards] = useState([]);
  const [mode, setMode] = useState('flashcards');
  const [saved, setSaved] = useState([]);
  const [message, setMessage] = useState('');
  useEffect(() => {
    try { const data=JSON.parse(localStorage.getItem(storageKey) || '[]'); if(Array.isArray(data)) setSaved(data.filter(deck=>Array.isArray(deck.cards) && deck.cards.every(card=>typeof card.question==='string' && typeof card.answer==='string')).slice(0,10)); } catch { setMessage('Saved decks could not be read. You can still create a new deck.'); }
  }, []);
  const create = (nextMode) => {
    const parsed = parseStudyNotes(notes);
    if (!parsed.length) { setMessage('Add a term and answer separated by a colon, one per line.'); return; }
    setCards(parsed); setMode(nextMode); setMessage('Ready to study. This demo formats your notes locally; no AI request was made.');
  };
  const save = () => {
    const next=[{name:`Study deck ${saved.length + 1}`, cards},...saved].slice(0,10);
    try { localStorage.setItem(storageKey,JSON.stringify(next)); setSaved(next); setMessage('Saved in this browser. Open the deck below whenever you need it.'); }
    catch { setMessage('Browser storage is unavailable. Use the export controls to keep your work.'); }
  };
  return <div className="portfolio-study">
    <header><a href="/demo">Just CTRL + V</a><span>Interactive portfolio demo</span></header>
    <main>
      <div className="study-intro"><p>From notes to a study session</p><h1>A little structure.<br />A better way to remember.</h1><p>Try the real flashcard and reviewer interfaces. This demo uses local notes instead of AI scanning, accounts, or payments.</p></div>
      {!cards.length ? <section className="study-editor" aria-label="Study notes">
        <label htmlFor="demo-notes">Your notes</label><p>One <strong>term: answer</strong> per line. Up to 30 cards.</p>
        <textarea id="demo-notes" maxLength={20000} value={notes} onChange={event=>setNotes(event.target.value)} rows={7} />
        <div className="study-actions"><button onClick={()=>create('flashcards')}>Create flashcards</button><button onClick={()=>create('table')}>Create reviewer</button><button className="quiet" onClick={()=>{setNotes(sample);setMessage('Sample notes loaded.');}}>Load sample</button></div>
      </section> : <section aria-label="Study results">
        <div className="study-actions"><button className="quiet" onClick={()=>setMode(mode==='flashcards'?'table':'flashcards')}>Switch to {mode==='flashcards'?'reviewer':'flashcards'}</button></div>
        {mode==='flashcards' ? <FlashcardGrid key={JSON.stringify(cards)} flashcards={cards} onReset={()=>setCards([])} onSaveClick={save} /> : <TableResult rows={cards.map(card=>({Question:card.question,Answer:card.answer}))} onReset={()=>setCards([])} onSaveClick={save} />}
      </section>}
      <p className="study-message" role="status">{message}</p>
      <section className="study-saved"><h2>Saved in this browser</h2>{!saved.length && <p>Your saved decks will appear here.</p>}<div>{saved.map((deck,index)=><button key={index} onClick={()=>{setCards(deck.cards);setMode('flashcards');setMessage(`${deck.name} opened.`);}}>{deck.name}<small>{deck.cards.length} cards</small></button>)}</div></section>
    </main>
    <footer>The full project includes document scanning and account features. This demonstration needs no credentials.</footer>
  </div>;
}
