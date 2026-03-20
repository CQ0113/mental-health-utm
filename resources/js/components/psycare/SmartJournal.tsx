import { useMemo, useState } from 'react';
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

export default function SmartJournal() {
    const language = usePsycareLanguage();
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

    const handleQuickReply = (text: string) => {
        setChatInput(text);
    };

    const handleSaveChat = () => {
        setStatusMessage(
            language === 'en'
                ? 'Chat conversation saved for counselor review (mock).'
                : 'Perbualan chat disimpan untuk semakan kaunselor (mock).',
        );
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
                {language === 'en' ? 'AI Counselor Chatbot (NLP)' : 'Chatbot Kaunselor AI (NLP)'}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
                {language === 'en'
                    ? 'Chat with the AI counselor for early emotional-support screening.'
                    : 'Berbual dengan kaunselor AI untuk semakan awal sokongan emosi.'}
            </p>

            <div className="mt-4 h-80 space-y-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                            message.role === 'user'
                                ? 'ml-auto bg-red-800 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                        }`}
                    >
                        {message.text}
                    </div>
                ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
                {quickReplies.map((quickReply) => (
                    <button
                        key={quickReply}
                        type="button"
                        onClick={() => handleQuickReply(quickReply)}
                        className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50"
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
                        language === 'en'
                            ? 'Type your message here...'
                            : 'Taip mesej anda di sini...'
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm shadow-sm outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-100"
                />
                <button
                    type="button"
                    onClick={handleSendMessage}
                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900"
                >
                    {language === 'en' ? 'Send' : 'Hantar'}
                </button>
            </div>

            {flaggedForRisk && (
                <div className="mt-4 rounded-lg border border-yellow-400 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                    {language === 'en'
                        ? 'NLP system detected a high stress level. This case has been auto-flagged and the on-duty counselor has been notified for immediate action.'
                        : 'Sistem NLP mengesan tahap tekanan yang tinggi. Kes ini telah ditandakan (Auto-Flagged) dan kaunselor bertugas telah dimaklumkan untuk tindakan segera.'}
                </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={handleSaveChat}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                    {language === 'en' ? 'Save Chat' : 'Simpan Chat'}
                </button>
            </div>

            {statusMessage && (
                <p className="mt-3 text-sm text-green-700">{statusMessage}</p>
            )}
        </section>
    );
}
