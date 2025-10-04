import { useState } from 'react';
import { parseCSV } from '../lib/csv';
import { saveQuestions } from '../lib/db.indexeddb';

export default function Admin() {
  const [report, setReport] = useState<string[]>([]);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { questions, errors } = parseCSV(text);
    await saveQuestions(questions);
    setReport(errors.length ? errors : ['Import réussi']);
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Importer le CSV</h2>
      <input type="file" accept=".csv" onChange={e => e.target.files && handleFile(e.target.files[0])} />
      <ul className="list-disc ml-5">
        {report.map((r, i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
