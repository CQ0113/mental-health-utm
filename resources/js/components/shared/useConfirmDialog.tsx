import { useState } from 'react';

type ConfirmTone = 'default' | 'danger';

type ConfirmOptions = {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    tone?: ConfirmTone;
};

type ConfirmState = {
    isOpen: boolean;
    options: ConfirmOptions;
};

const defaultOptions: ConfirmOptions = {
    title: 'Confirm Action',
    message: 'Are you sure you want to continue?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    tone: 'default',
};

export const useConfirmDialog = () => {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        options: defaultOptions,
    });
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const closeDialog = (value: boolean) => {
        if (resolver) {
            resolver(value);
        }

        setResolver(null);
        setState((current) => ({
            ...current,
            isOpen: false,
        }));
    };

    const confirm = (options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setResolver(() => resolve);
            setState({
                isOpen: true,
                options: {
                    ...defaultOptions,
                    ...options,
                },
            });
        });
    };

    const confirmDialog = state.isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-5 shadow-xl">
                <h3 className="text-base font-semibold text-gray-900">{state.options.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{state.options.message}</p>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => closeDialog(false)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        {state.options.cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => closeDialog(true)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                            state.options.tone === 'danger'
                                ? 'bg-red-700 hover:bg-red-800'
                                : 'bg-slate-800 hover:bg-slate-900'
                        }`}
                    >
                        {state.options.confirmText}
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return {
        confirm,
        confirmDialog,
    };
};
