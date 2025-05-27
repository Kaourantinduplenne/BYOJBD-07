'use client';
import { useState } from 'react';
import { Rnd } from 'react-rnd';
import Draggable from 'react-draggable';

const colors = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8'];

export default function RigJBDBuilder() {
  const [operation, setOperation] = useState('');
  const [rig, setRig] = useState('');
  const [pic, setPic] = useState('');
  const [lofHazard, setLofHazard] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [workers, setWorkers] = useState([]);
  const [positions, setPositions] = useState({});
  const [diagram, setDiagram] = useState('');
  const [zones, setZones] = useState({ green: [], red: [], black: [] });
  const [arrows, setArrows] = useState([]);
  const [arrowId, setArrowId] = useState(0);
  const [zoneId, setZoneId] = useState(0);
  const [taskStep, setTaskStep] = useState('');
  const [taskPersons, setTaskPersons] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pdfUrl, setPdfUrl] = useState('');

  const addWorker = () => {
    if (workerName.trim()) {
      setWorkers([...workers, workerName]);
      setWorkerName('');
    }
  };

  const updatePosition = (index, data) => {
    setPositions({ ...positions, [index]: { x: data.x, y: data.y } });
  };

  const addZone = (color) => {
    const id = zoneId + 1;
    setZones(prev => ({ ...prev, [color]: [...prev[color], { id, x: 20, y: 20, w: 100, h: 100 }] }));
    setZoneId(id);
  };

  const updateZone = (color, id, newZone) => {
    setZones(prev => ({
      ...prev,
      [color]: prev[color].map(z => z.id === id ? newZone : z)
    }));
  };

  const addArrow = () => {
    const id = arrowId + 1;
    setArrows([...arrows, { id, x: 30, y: 30, w: 100, h: 10, rotate: 0 }]);
    setArrowId(id);
  };

  const updateArrow = (id, newData) => {
    setArrows(arrows.map(a => a.id === id ? { ...a, ...newData } : a));
  };

  const addTask = () => {
    if (taskStep && taskPersons.length > 0) {
      setTasks([...tasks, { step: taskStep, persons: [...taskPersons] }]);
      setTaskStep('');
      setTaskPersons([]);
    }
  };

  const handleGeneratePDF = async () => {
    const res = await fetch('/api/generate-jbd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, rig, pic, lofHazard, workers, tasks })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
  };

  return (
    <div className="p-4 space-y-4 w-[1123px] h-[794px] border-2 border-black overflow-auto text-sm">
      <h1 className="text-xl font-bold text-center">Build Your Own Job By Design</h1>
      <div className="flex space-x-2">
        <div className="flex flex-col"><label>OPERATION</label><input value={operation} onChange={(e) => setOperation(e.target.value)} className="border rounded p-1" /></div>
        <div className="flex flex-col"><label>RIG</label><input value={rig} onChange={(e) => setRig(e.target.value)} className="border rounded p-1" /></div>
        <div className="flex flex-col"><label>PIC</label><input value={pic} onChange={(e) => setPic(e.target.value)} className="border rounded p-1" /></div>
      </div>
      <div className="flex flex-col">
        <label>LINE OF FIRE HAZARD</label>
        <input value={lofHazard} onChange={(e) => setLofHazard(e.target.value)} className="border rounded p-1 w-full" />
      </div>
      <div className="flex space-x-2 items-end">
        <div className="flex flex-col w-full"><label>Add Personnel</label><input value={workerName} onChange={(e) => setWorkerName(e.target.value)} className="border rounded p-1" /></div>
        <button onClick={addWorker} className="bg-blue-600 text-white px-2 py-1 rounded h-fit">Add</button>
      </div>
      <ul className="space-y-1">
        {workers.map((w, i) => <li key={i}>{i + 1}. {w}</li>)}
      </ul>
      <div className="flex flex-col">
        <label>Select Diagram</label>
        <select value={diagram} onChange={(e) => setDiagram(e.target.value)} className="border rounded p-1 w-full">
          <option value="">Select...</option>
          <option value="Drillfloor">Drillfloor</option>
          <option value="Helideck">Helideck</option>
          <option value="Deck">Deck</option>
        </select>
      </div>
      <div className="flex space-x-2 mb-2">
        <button onClick={() => addZone('green')} className="bg-green-500 text-white px-2 py-1 rounded">+ Green Zone</button>
        <button onClick={() => addZone('red')} className="bg-red-500 text-white px-2 py-1 rounded">+ Red Zone</button>
        <button onClick={() => addZone('black')} className="bg-black text-white px-2 py-1 rounded">+ Black Zone</button>
        <button onClick={addArrow} className="bg-blue-500 text-white px-2 py-1 rounded">+ Blue Arrow</button>
      </div>
      <div className="relative w-full h-[300px] border bg-white">
        {diagram && <img src={`/${diagram}.png`} alt={diagram} className="absolute w-full h-full object-contain" />}
        {workers.map((w, i) => (
          <Draggable key={i} position={positions[i] || { x: 10 + i * 10, y: 10 + i * 10 }} onStop={(e, d) => updatePosition(i, d)}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: colors[i % colors.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', position: 'absolute', cursor: 'move' }}>
              {i + 1}
            </div>
          </Draggable>
        ))}
        {['green', 'red', 'black'].flatMap(color => zones[color].map(z => (
          <Rnd key={`${color}-${z.id}`} size={{ width: z.w, height: z.h }} position={{ x: z.x, y: z.y }}
            onDragStop={(e, d) => updateZone(color, z.id, { ...z, x: d.x, y: d.y })}
            onResizeStop={(e, dir, ref, delta, pos) => updateZone(color, z.id, { width: parseInt(ref.style.width), height: parseInt(ref.style.height), ...pos })}
            style={{ border: `2px dashed ${color}`, backgroundColor: color === 'black' ? 'rgba(0,0,0,0.1)' : color === 'red' ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)', position: 'absolute' }}
          />
        )))}
        {arrows.map(a => (
          <Rnd key={`a-${a.id}`} size={{ width: a.w, height: a.h }} position={{ x: a.x, y: a.y }}
            onDragStop={(e, d) => updateArrow(a.id, { x: d.x, y: d.y })}
            onResizeStop={(e, dir, ref, delta, pos) => updateArrow(a.id, { w: parseInt(ref.style.width), h: parseInt(ref.style.height), ...pos })}
            style={{ position: 'absolute', overflow: 'visible' }}
          >
            <div style={{ width: '100%', height: '100%', transform: `rotate(${a.rotate}deg)`, transformOrigin: 'center center', backgroundColor: 'blue', borderRadius: '4px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'move' }}>
              ↔
            </div>
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 flex gap-1">
              <button onClick={() => updateArrow(a.id, { rotate: 0 })} className="text-xs bg-gray-300 px-1 rounded">↔</button>
              <button onClick={() => updateArrow(a.id, { rotate: 90 })} className="text-xs bg-gray-300 px-1 rounded">↕</button>
              <button onClick={() => updateArrow(a.id, { rotate: 45 })} className="text-xs bg-gray-300 px-1 rounded">⤺</button>
              <button onClick={() => updateArrow(a.id, { rotate: 315 })} className="text-xs bg-gray-300 px-1 rounded">⤻</button>
            </div>
          </Rnd>
        )))}
      </div>
      <div className="flex space-x-2 items-end mt-2">
        <div className="flex flex-col w-full">
          <label>Task Step</label>
          <input value={taskStep} onChange={(e) => setTaskStep(e.target.value)} className="border rounded p-1 w-full" />
        </div>
        <div className="flex flex-col w-full">
          <label>Assign Personnel</label>
          <select multiple value={taskPersons} onChange={(e) => setTaskPersons(Array.from(e.target.selectedOptions, o => o.value))} className="border rounded p-1 w-full">
            {workers.map((w, i) => <option key={i} value={w}>{w}</option>)}
          </select>
        </div>
        <button onClick={addTask} className="bg-green-600 text-white px-4 py-1 rounded h-fit">Add Task</button>
      </div>
      <div className="space-y-1 mt-2">
        {tasks.map((t, i) => (
          <div key={i} className="border p-2 rounded">
            {i + 1}. {t.step} (Persons: {t.persons.join(', ')})
          </div>
        ))}
      </div>
      <button onClick={handleGeneratePDF} className="bg-indigo-600 text-white px-4 py-2 rounded">Export PDF Preview</button>
      {pdfUrl && <iframe src={pdfUrl} title="PDF Preview" className="w-full h-[300px] border mt-2" />}
    </div>
  );
}
