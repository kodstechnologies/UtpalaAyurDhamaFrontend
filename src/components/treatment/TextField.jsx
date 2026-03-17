// // src/components/TherapistNote.jsx  (or wherever you keep it)

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useParams } from 'react-router-dom';
// import { getApiUrl, getAuthHeaders } from '../../config/api';   // adjust path if needed

// const TherapistNote = () => {
//     const { id } = useParams();   // gets :id from the current route
//     console.log("🚀 ~ TherapistNote ~ id:", id)

//     const [note, setNote] = useState('');
//     const [isEditing, setIsEditing] = useState(false);
//     const [editValue, setEditValue] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     // Build API endpoint using the route param :id
//     const API_BASE = `${getApiUrl('therapist-sessions')}/therapistNote/${id}`;

//     // Fetch note when component mounts or when id changes
//     useEffect(() => {
//         if (!id) {
//             setError('No session ID found in URL');
//             return;
//         }

//         const fetchNote = async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 const res = await axios.get(API_BASE, {
//                     headers: getAuthHeaders(),
//                 });

//                 console.log('Fetch note response:', res.data);

//                 if (res.data?.success) {
//                     const fetchedNote = res.data.data || '';
//                     setNote(fetchedNote);
//                     setEditValue(fetchedNote);
//                 } else {
//                     setError(res.data?.message || 'Failed to load note');
//                 }
//             } catch (err) {
//                 console.error('Failed to load note:', err);
//                 setError('Could not load note. Please try again.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchNote();

//         // Optional: clean up (not usually needed here)
//         return () => {
//             // cleanup if needed (e.g. cancel axios request with AbortController)
//         };
//     }, [id]);   // ← important: depend on id from useParams

//     const handleAddOrSave = async () => {
//         if (!editValue.trim()) return; // don't allow empty save

//         setLoading(true);
//         setError(null);

//         try {
//             let res;

//             if (note === '') {
//                 // CREATE - POST
//                 res = await axios.post(
//                     API_BASE,
//                     { note: editValue },
//                     { headers: getAuthHeaders() }
//                 );
//             } else {
//                 // UPDATE - PATCH
//                 res = await axios.patch(
//                     API_BASE,
//                     { note: editValue },
//                     { headers: getAuthHeaders() }
//                 );
//             }

//             console.log('Save response:', res.data);

//             if (res.data?.success) {
//                 const updatedNote = res.data.data?.therapistNote || '';
//                 setNote(updatedNote);
//                 setEditValue(updatedNote);
//                 setIsEditing(false);
//             } else {
//                 setError(res.data?.message || 'Failed to save note');
//             }
//         } catch (err) {
//             console.error('Save failed:', err);
//             setError('Failed to save note');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDelete = async () => {
//         if (!window.confirm('Are you sure you want to delete this note?')) return;

//         setLoading(true);
//         setError(null);

//         try {
//             const res = await axios.delete(API_BASE, {
//                 headers: getAuthHeaders(),
//             });

//             if (res.data?.success) {
//                 setNote('');
//                 setEditValue('');
//                 setIsEditing(false);
//             } else {
//                 setError(res.data?.message || 'Failed to delete');
//             }
//         } catch (err) {
//             console.error('Delete failed:', err);
//             setError('Failed to delete note');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const startEditing = () => {
//         setEditValue(note);
//         setIsEditing(true);
//     };

//     const cancelEdit = () => {
//         setEditValue(note);
//         setIsEditing(false);
//         setError(null);
//     };

//     // ────────────────────────────────────────────────
//     // Rendering
//     // ────────────────────────────────────────────────

//     if (!id) {
//         return <div className="text-red-600 p-4">Invalid session URL</div>;
//     }

//     if (loading) {
//         return <div className="text-gray-500 p-4">Loading note...</div>;
//     }

//     if (error) {
//         return <div className="text-red-600 p-4">{error}</div>;
//     }

//     return (
//         <div className="therapist-note mt-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
//             {isEditing ? (
//                 <div className="space-y-4">
//                     <textarea
//                         value={editValue}
//                         onChange={(e) => setEditValue(e.target.value)}
//                         placeholder="Enter therapist note here..."
//                         rows={5}
//                         className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
//                     />

//                     <div className="flex gap-3">
//                         <button
//                             onClick={handleAddOrSave}
//                             disabled={loading || !editValue.trim()}
//                             className={`px-5 py-2 rounded-md text-white font-medium transition
//                 ${loading || !editValue.trim()
//                                     ? 'bg-gray-400 cursor-not-allowed'
//                                     : 'bg-blue-600 hover:bg-blue-700'}`}
//                         >
//                             {loading ? 'Saving...' : note ? 'Update Note' : 'Add Note'}
//                         </button>

//                         <button
//                             onClick={cancelEdit}
//                             className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             ) : (
//                 <div className="space-y-4">
//                     {note ? (
//                         <>
//                             <div className="whitespace-pre-wrap text-gray-800 leading-relaxed border-l-4 border-blue-500 pl-4 py-1">
//                                 {note}
//                             </div>

//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={startEditing}
//                                     className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
//                                 >
//                                     Edit
//                                 </button>

//                                 <button
//                                     onClick={handleDelete}
//                                     className="px-4 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
//                                 >
//                                     Delete
//                                 </button>
//                             </div>
//                         </>
//                     ) : (
//                         <button
//                             onClick={() => setIsEditing(true)}
//                             className="px-6 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
//                         >
//                             + Add Therapist Note
//                         </button>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TherapistNote;

// src/components/TherapistNote.jsx  (or wherever you keep it)
// TextField.jsx  (or rename to TherapistNoteField.jsx, SessionNote.jsx, etc.)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiUrl, getAuthHeaders } from '../../config/api'; // adjust path as needed
import { useParams } from 'react-router-dom';

const TextField = ({ sessionId }) => {

    const { id } = useParams();
    console.log("🚀 ~ TextField ~ sessionId:", sessionId, id)
    const [note, setNote] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If no sessionId is passed → early exit
    if (!sessionId) {
        sessionId = id;
    }

    const API_BASE = `${getApiUrl('therapist-sessions')}/therapistNote/${sessionId}`;

    // Fetch note when sessionId changes
    useEffect(() => {
        const fetchNote = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await axios.get(API_BASE, {
                    headers: getAuthHeaders(),
                });

                if (res.data?.success) {
                    const fetchedNote = res.data.data || '';
                    setNote(fetchedNote);
                    setEditValue(fetchedNote);
                } else {
                    setError(res.data?.message || 'Failed to load note');
                }
            } catch (err) {
                console.error('Failed to fetch note:', err);
                setError('Could not load note');
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [sessionId]);

    const handleSave = async () => {
        if (!editValue.trim()) return;

        setLoading(true);
        setError(null);

        try {
            let res;

            if (note === '') {
                // POST - create
                res = await axios.post(
                    API_BASE,
                    { note: editValue },
                    { headers: getAuthHeaders() }
                );
            } else {
                // PATCH - update
                res = await axios.patch(
                    API_BASE,
                    { note: editValue },
                    { headers: getAuthHeaders() }
                );
            }

            if (res.data?.success) {
                const updated = res.data.data?.therapistNote || '';
                setNote(updated);
                setEditValue(updated);
                setIsEditing(false);
            } else {
                setError(res.data?.message || 'Failed to save');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to save note');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this note?')) return;

        setLoading(true);
        setError(null);

        try {
            const res = await axios.delete(API_BASE, {
                headers: getAuthHeaders(),
            });

            if (res.data?.success) {
                setNote('');
                setEditValue('');
                setIsEditing(false);
            } else {
                setError(res.data?.message || 'Failed to delete');
            }
        } catch (err) {
            console.error('Delete error:', err);
            setError('Failed to delete note');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = () => {
        setEditValue(note);
        setIsEditing(true);
    };

    const cancel = () => {
        setEditValue(note);
        setIsEditing(false);
        setError(null);
    };

    // ────────────────────────────────────────────────
    // Render
    // ────────────────────────────────────────────────

    if (loading) {
        return <div className="text-gray-500 p-3">Loading...</div>;
    }

    if (error) {
        return <div className="text-red-600 p-3">{error}</div>;
    }

    return (
        <div className="note-container mt-3 p-4 border rounded-lg bg-gray-50/70">
            {isEditing ? (
                <div className="space-y-3">
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Write your note here..."
                        rows={4}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 resize-y min-h-[100px]"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={loading || !editValue.trim()}
                            className={`px-5 py-2 rounded font-medium text-white transition-colors ${loading || !editValue.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Saving...' : note ? 'Update' : 'Save Note'}
                        </button>

                        <button
                            onClick={cancel}
                            className="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {note.trim() ? (
                        <>
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed pl-3 border-l-4 border-blue-500 py-1">
                                {note}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={startEdit}
                                    className="px-4 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium"
                        >
                            + Add Note
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default TextField;