import { useEffect, useMemo, useRef, useState } from 'react';
import { usePsycareLanguage } from '@/lib/psycare-language';
import { saveChatbotRiskFlag } from '@/lib/psycare-data';

const riskKeywords = [
    'tertekan',
    'panic',
    'putus asa',
    'tak mampu',
    'stres',
    'cemas',
    'bunuh diri',
    'suicide',
    'nak mati',
];

type ChatMessage = {
    id: number;
    role: 'bot' | 'user';
    text: string;
};

type DragState = {
    isDragging: boolean;
    moved: boolean;
    offsetX: number;
    offsetY: number;
};

type ResizeState = {
    isResizing: boolean;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
};

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));

const PANEL_MIN_WIDTH = 340;
const PANEL_MIN_HEIGHT = 420;
const PANEL_MAX_WIDTH = 920;
const PANEL_MAX_HEIGHT = 760;

export default function FloatingChatbot() {
    const language = usePsycareLanguage();
    const dragRef = useRef<DragState>({
        isDragging: false,
        moved: false,
        offsetX: 0,
        offsetY: 0,
    });
    const resizeRef = useRef<ResizeState>({
        isResizing: false,
        startX: 0,
        startY: 0,
        startWidth: 380,
        startHeight: 500,
    });

    const [isReady, setIsReady] = useState(false);
    const [hasCustomPosition, setHasCustomPosition] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [panelSize, setPanelSize] = useState({ width: 380, height: 500 });
    const [chatInput, setChatInput] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [flaggedForRisk, setFlaggedForRisk] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 1,
            role: 'bot',
            text:
                language === 'en'
                    ? 'Hi, I am your AI counselor assistant. How are you feeling today?'
                    : 'Hai, saya pembantu kaunselor AI anda. Bagaimana perasaan anda hari ini?',
        },
    ]);

    useEffect(() => {
        const initialX = window.innerWidth - 84;
        const initialY = window.innerHeight - 96;
        setPosition({ x: initialX, y: initialY });
        setIsReady(true);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setPosition((current) => {
                const maxX = window.innerWidth - 56;
                const maxY = window.innerHeight - 56;

                return {
                    x: clamp(current.x, 16, maxX),
                    y: clamp(current.y, 16, maxY),
                };
            });

            setPanelSize((current) => {
                const maxWidth = Math.min(PANEL_MAX_WIDTH, window.innerWidth - 40);
                const maxHeight = Math.min(PANEL_MAX_HEIGHT, window.innerHeight - 40);

                return {
                    width: clamp(current.width, PANEL_MIN_WIDTH, maxWidth),
                    height: clamp(current.height, PANEL_MIN_HEIGHT, maxHeight),
                };
            });
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const quickReplies =
        language === 'en'
            ? [
                  'I feel anxious today',
                  'I cannot sleep well lately',
                  'I am stressed about assignments',
                  'I need someone to talk to',
              ]
            : [
                  'Saya rasa cemas hari ini',
                  'Saya susah tidur kebelakangan ini',
                  'Saya tertekan dengan tugasan',
                  'Saya perlukan seseorang untuk berbual',
              ];

    const shouldFlagCase = useMemo(() => {
        const normalizedText = chatInput.toLowerCase();
        const containsRiskKeyword = riskKeywords.some((keyword) =>
            normalizedText.includes(keyword),
        );

        return containsRiskKeyword || chatInput.length > 180;
    }, [chatInput]);

    const generateBotReply = (text: string) => {
        const normalized = text.toLowerCase();

        if (
            normalized.includes('stres') ||
            normalized.includes('stress') ||
            normalized.includes('tertekan')
        ) {
            return language === 'en'
                ? 'Thank you for sharing. Let us slow down: inhale for 4 counts, hold for 4, exhale for 6. Would you like me to suggest a short coping plan?'
                : 'Terima kasih kerana berkongsi. Mari bertenang: tarik nafas 4 kiraan, tahan 4, hembus 6. Adakah anda mahu saya cadangkan pelan coping ringkas?';
        }

        if (normalized.includes('exam') || normalized.includes('peperiksaan')) {
            return language === 'en'
                ? 'Exam pressure can feel intense. We can break your tasks into 25-minute blocks with short breaks to reduce overwhelm.'
                : 'Tekanan peperiksaan memang boleh terasa berat. Kita boleh pecahkan tugasan kepada blok 25 minit dengan rehat pendek untuk kurangkan beban.';
        }

        return language === 'en'
            ? 'I hear you. You are taking a good step by expressing this. I can guide you through grounding, journaling prompts, or reaching out for support.'
            : 'Saya dengar anda. Anda sedang buat langkah yang baik dengan meluahkan perkara ini. Saya boleh bantu dengan teknik grounding, soalan jurnal, atau cadangan mendapatkan sokongan.';
    };

    const handleSendMessage = () => {
        if (!chatInput.trim()) {
            return;
        }

        const userMessage: ChatMessage = {
            id: Date.now(),
            role: 'user',
            text: chatInput,
        };

        const botMessage: ChatMessage = {
            id: Date.now() + 1,
            role: 'bot',
            text: generateBotReply(chatInput),
        };

        const isRisk = shouldFlagCase;

        setMessages((previousState) => [...previousState, userMessage, botMessage]);
        setChatInput('');

        if (isRisk) {
            setFlaggedForRisk(true);
            saveChatbotRiskFlag({
                flaggedAt: new Date().toISOString(),
                message: userMessage.text,
                severity: userMessage.text.length > 180 ? 'high' : 'moderate',
                source: 'ai-chatbot',
            });
        }
    };

    const handleSaveChat = () => {
        setStatusMessage(
            language === 'en'
                ? 'Chat conversation saved for counselor review (mock).'
                : 'Perbualan chat disimpan untuk semakan kaunselor (mock).',
        );
    };

    const handleMouseMove = (event: MouseEvent) => {
        if (!dragRef.current.isDragging) {
            return;
        }

        const maxX = window.innerWidth - 56;
        const maxY = window.innerHeight - 56;
        const nextX = clamp(event.clientX - dragRef.current.offsetX, 16, maxX);
        const nextY = clamp(event.clientY - dragRef.current.offsetY, 16, maxY);

        dragRef.current.moved = true;
        setHasCustomPosition(true);
        setPosition({ x: nextX, y: nextY });
    };

    const handleResizeMouseMove = (event: MouseEvent) => {
        if (!resizeRef.current.isResizing) {
            return;
        }

        const deltaX = event.clientX - resizeRef.current.startX;
        const deltaY = event.clientY - resizeRef.current.startY;
        const maxWidth = Math.min(PANEL_MAX_WIDTH, window.innerWidth - 40);
        const maxHeight = Math.min(PANEL_MAX_HEIGHT, window.innerHeight - 40);

        setPanelSize({
            width: clamp(resizeRef.current.startWidth + deltaX, PANEL_MIN_WIDTH, maxWidth),
            height: clamp(resizeRef.current.startHeight + deltaY, PANEL_MIN_HEIGHT, maxHeight),
        });
    };

    const handleMouseUp = () => {
        if (!dragRef.current.isDragging) {
            return;
        }

        const wasMoved = dragRef.current.moved;
        dragRef.current.isDragging = false;

        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        if (!wasMoved) {
            setIsOpen((current) => !current);
        }
    };

    const handleResizeMouseUp = () => {
        if (!resizeRef.current.isResizing) {
            return;
        }

        resizeRef.current.isResizing = false;
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        dragRef.current.isDragging = true;
        dragRef.current.moved = false;
        dragRef.current.offsetX = event.clientX - position.x;
        dragRef.current.offsetY = event.clientY - position.y;

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        resizeRef.current.isResizing = true;
        resizeRef.current.startX = event.clientX;
        resizeRef.current.startY = event.clientY;
        resizeRef.current.startWidth = panelSize.width;
        resizeRef.current.startHeight = panelSize.height;

        window.addEventListener('mousemove', handleResizeMouseMove);
        window.addEventListener('mouseup', handleResizeMouseUp);
    };

    if (!isReady) {
        return null;
    }

    return (
        <div
            className="fixed z-[70]"
            style={
                hasCustomPosition
                    ? { left: `${position.x}px`, top: `${position.y}px` }
                    : { right: '24px', bottom: '24px' }
            }
        >
            {isOpen && (
                <div
                    className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ${
                        isMaximized
                            ? 'fixed inset-4'
                            : 'absolute bottom-16 right-0'
                    }`}
                    style={
                        isMaximized
                            ? undefined
                            : {
                                  width: `${panelSize.width}px`,
                                  height: `${panelSize.height}px`,
                              }
                    }
                >
                    <div className="flex h-full flex-col p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">
                                    {language === 'en'
                                        ? 'AI Counselor Chatbot (NLP)'
                                        : 'Chatbot Kaunselor AI (NLP)'}
                                </h3>
                                <p className="mt-1 text-xs text-gray-600">
                                    {language === 'en'
                                        ? 'Early emotional-support screening chat.'
                                        : 'Perbualan semakan awal sokongan emosi.'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsMaximized((current) => !current)}
                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                {isMaximized
                                    ? language === 'en'
                                        ? 'Restore'
                                        : 'Kembali'
                                    : language === 'en'
                                      ? 'Maximize'
                                      : 'Besarkan'}
                            </button>
                        </div>

                        <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`max-w-[90%] rounded-lg px-3 py-2 text-xs ${
                                    message.role === 'user'
                                        ? 'ml-auto bg-red-800 text-white'
                                        : 'border border-gray-200 bg-white text-gray-800'
                                }`}
                            >
                                {message.text}
                            </div>
                        ))}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {quickReplies.map((quickReply) => (
                                <button
                                    key={quickReply}
                                    type="button"
                                    onClick={() => setChatInput(quickReply)}
                                    className="rounded-full border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {quickReply}
                                </button>
                            ))}
                        </div>

                        <div className="mt-3 flex gap-2">
                            <input
                                value={chatInput}
                                onChange={(event) => setChatInput(event.target.value)}
                                placeholder={
                                    language === 'en' ? 'Type your message...' : 'Taip mesej anda...'
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                            <button
                                type="button"
                                onClick={handleSendMessage}
                                className="rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-white hover:bg-red-900"
                            >
                                {language === 'en' ? 'Send' : 'Hantar'}
                            </button>
                        </div>

                        {flaggedForRisk && (
                            <div className="mt-3 rounded-lg border border-yellow-400 bg-yellow-50 px-3 py-2 text-xs text-yellow-800">
                                {language === 'en'
                                    ? 'NLP detected elevated risk. Case has been auto-flagged for counselor attention.'
                                    : 'NLP mengesan risiko tinggi. Kes telah ditandakan automatik untuk perhatian kaunselor.'}
                            </div>
                        )}

                        <div className="mt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={handleSaveChat}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                                {language === 'en' ? 'Save Chat' : 'Simpan Chat'}
                            </button>
                        </div>

                        {statusMessage && (
                            <p className="mt-2 text-xs text-green-700">{statusMessage}</p>
                        )}

                        {!isMaximized && (
                            <button
                                type="button"
                                onMouseDown={handleResizeMouseDown}
                                aria-label={language === 'en' ? 'Resize chat window' : 'Ubah saiz tetingkap chat'}
                                className="absolute bottom-1 right-1 h-5 w-5 cursor-se-resize rounded-sm"
                                title={
                                    language === 'en'
                                        ? 'Drag to resize'
                                        : 'Seret untuk ubah saiz'
                                }
                            >
                                <svg
                                    viewBox="0 0 12 12"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M3 9L9 3M6 9L9 6M8 9L9 8"
                                        stroke="currentColor"
                                        strokeWidth="1.2"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}

            <button
                type="button"
                onMouseDown={handleMouseDown}
                aria-label={language === 'en' ? 'Open AI chatbot' : 'Buka chatbot AI'}
                className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-800 text-white shadow-lg transition hover:bg-red-900"
                title={language === 'en' ? 'Drag or click chatbot' : 'Seret atau klik chatbot'}
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7"
                    aria-hidden="true"
                >
                    <path
                        d="M12 12C14.4853 12 16.5 9.98528 16.5 7.5C16.5 5.01472 14.4853 3 12 3C9.51472 3 7.5 5.01472 7.5 7.5C7.5 9.98528 9.51472 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M4 20C4.8 16.8 7.7 14.5 12 14.5C16.3 14.5 19.2 16.8 20 20"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            </button>
        </div>
    );
}
