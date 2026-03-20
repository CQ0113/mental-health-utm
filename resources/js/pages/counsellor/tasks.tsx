import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import CounsellorLayout from '@/components/counsellor/Layout';
import { counsellorPortalMockData } from '@/lib/psycare-data';

type TaskForm = {
    title: string;
    notes: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
};

type ManagedTask = {
    id: string;
    title: string;
    notes: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
};

const getTaskBadgeClass = (priority: 'low' | 'medium' | 'high') => {
    if (priority === 'low') {
        return 'bg-slate-100 text-slate-700';
    }

    if (priority === 'medium') {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-red-100 text-red-800';
};

export default function CounsellorTasksPage() {
    const [actionMessage, setActionMessage] = useState('');
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [notesFilter, setNotesFilter] = useState<'all' | 'with-notes' | 'without-notes'>('all');
    const [taskForm, setTaskForm] = useState<TaskForm>({
        title: '',
        notes: '',
        dueDate: '',
        priority: 'high',
    });
    const [managedTasks, setManagedTasks] = useState<ManagedTask[]>(
        counsellorPortalMockData.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            notes: '',
            dueDate: task.dueAt,
            priority: task.priority,
        })),
    );

    const updateTaskField = <K extends keyof TaskForm>(
        field: K,
        value: TaskForm[K],
    ) => {
        setTaskForm((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleCreateTask = () => {
        if (!taskForm.title.trim() || !taskForm.dueDate) {
            setActionMessage('Please complete title and due date.');
            return;
        }

        const newTask: ManagedTask = {
            id: `TASK-${Date.now()}`,
            title: taskForm.title.trim(),
            notes: taskForm.notes.trim(),
            dueDate: taskForm.dueDate,
            priority: taskForm.priority,
        };

        setManagedTasks((current) => [newTask, ...current]);
        setTaskForm({
            title: '',
            notes: '',
            dueDate: '',
            priority: taskForm.priority,
        });
        setActionMessage(
            `Task "${newTask.title}" created with ${newTask.priority} priority (mock).`,
        );
        setIsTaskFormOpen(false);
    };

    const filteredTasks = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        return managedTasks.filter((task) => {
            const searchableText = [
                task.title,
                task.notes,
                task.dueDate,
                task.priority,
            ]
                .join(' ')
                .toLowerCase();

            const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);
            const matchesPriority =
                priorityFilter === 'all' || task.priority === priorityFilter;
            const hasNotes = task.notes.trim().length > 0;
            const matchesNotes =
                notesFilter === 'all' ||
                (notesFilter === 'with-notes' && hasNotes) ||
                (notesFilter === 'without-notes' && !hasNotes);

            return matchesSearch && matchesPriority && matchesNotes;
        });
    }, [managedTasks, searchTerm, priorityFilter, notesFilter]);

    return (
        <>
            <Head title="Counsellor Tasks" />
            <CounsellorLayout
                title="Tasks"
                subtitle="Manage intervention actions and due items"
            >
                {actionMessage && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        {actionMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900">Counsellor Task Board</h2>
                        <button
                            type="button"
                            onClick={() => setIsTaskFormOpen((current) => !current)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            {isTaskFormOpen ? 'Hide Task Form' : 'Create Task'}
                        </button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Search
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by title, notes, due date, or priority"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            />
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Priority 
                            <select
                                value={priorityFilter}
                                onChange={(event) =>
                                    setPriorityFilter(
                                        event.target.value as 'all' | 'low' | 'medium' | 'high',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="all">All Priorities</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                            Notes Filter
                            <select
                                value={notesFilter}
                                onChange={(event) =>
                                    setNotesFilter(
                                        event.target.value as 'all' | 'with-notes' | 'without-notes',
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal normal-case text-gray-800 shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                            >
                                <option value="all">All Tasks</option>
                                <option value="with-notes">With Notes</option>
                                <option value="without-notes">Without Notes</option>
                            </select>
                        </label>
                    </div>

                    {isTaskFormOpen && (
                        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">Create Task</h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Add a new task with title, notes, due date, and priority.
                            </p>

                            <div className="mt-4 grid gap-3 md:grid-cols-3">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Title</span>
                                    <input
                                        type="text"
                                        value={taskForm.title}
                                        onChange={(event) => updateTaskField('title', event.target.value)}
                                        placeholder="Example: Check-in call with high-risk client"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Priority</span>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(event) =>
                                            updateTaskField(
                                                'priority',
                                                event.target.value as TaskForm['priority'],
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Due Date</span>
                                    <input
                                        type="date"
                                        value={taskForm.dueDate}
                                        onChange={(event) => updateTaskField('dueDate', event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                                    />
                                </label>
                            </div>

                            <div className="mt-3 space-y-3">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Notes</span>
                                    <textarea
                                        rows={3}
                                        value={taskForm.notes}
                                        onChange={(event) => updateTaskField('notes', event.target.value)}
                                        placeholder="Add intervention details or reminders"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-100"
                                    />
                                </label>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleCreateTask}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Add Task
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-4 space-y-3">
                        {filteredTasks.map((task) => (
                            <div key={task.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getTaskBadgeClass(task.priority)}`}
                                    >
                                        {task.priority.toUpperCase()}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-gray-600">Due: {task.dueDate}</p>
                                {task.notes && (
                                    <p className="mt-1 text-xs text-gray-600">Notes: {task.notes}</p>
                                )}
                            </div>
                        ))}

                        {filteredTasks.length === 0 && (
                            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                No tasks match your search.
                            </p>
                        )}
                    </div>
                </section>
            </CounsellorLayout>
        </>
    );
}
