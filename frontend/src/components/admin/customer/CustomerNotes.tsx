import { useEffect, useState } from "react";
import { customerService } from "../../../services/customer.service";

interface Props {
  customerId: string;
}

export default function CustomerNotes({
  customerId,
}: Props) {
  const [notes, setNotes] = useState<any[]>([]);
  const [note, setNote] = useState("");

  const loadNotes = async () => {
    try {
      const data = await customerService.getNotes(customerId);
      setNotes(data);
    } catch (error) {
      console.error(error);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;

    try {
      await customerService.addNote(
        customerId,
        note
      );

      setNote("");
      loadNotes();
    } catch (error) {
      console.error(error);
      alert("Unable to save note");
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">
        Customer Notes
      </h2>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded border p-3"
          placeholder="Enter note"
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
        />

        <button
          onClick={addNote}
          className="rounded bg-blue-600 px-4 text-white"
        >
          Add
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {notes.length === 0 ? (
          <p>No Notes Found</p>
        ) : (
          notes.map((item) => (
            <div
              key={item.id}
              className="rounded border p-3"
            >
              <p>{item.note}</p>

              <small className="text-gray-500">
                {new Date(
                  item.createdAt
                ).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}