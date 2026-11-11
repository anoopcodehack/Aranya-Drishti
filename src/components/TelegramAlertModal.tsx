import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  X,
  Settings,
  Globe,
  BellRing,
  ExternalLink,
} from 'lucide-react';
import { sendTelegramAlert } from '../utils/inferenceEngine';

export interface AlertNotificationData {
  id: string;
  threatType: 'chainsaw' | 'elephant' | 'ambient' | 'poaching_gunshot';
  towerName: string;
  englishMessage: string;
  kannadaMessage: string;
  timestamp: string;
  recipientsCount: number;
}

interface TelegramAlertModalProps {
  currentAlert: AlertNotificationData | null;
  onClose: () => void;
}

export const TelegramAlertModal: React.FC<TelegramAlertModalProps> = ({
  currentAlert,
  onClose,
}) => {
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  if (!currentAlert) return null;

  const isCritical = currentAlert.threatType === 'chainsaw';

  const handleTestRealTelegram = async () => {
    setIsSending(true);
    setDispatchStatus('Connecting to Telegram Bot API Gateway...');
    const res = await sendTelegramAlert(
      currentAlert.englishMessage,
      currentAlert.kannadaMessage,
      currentAlert.towerName,
      botToken,
      chatId
    );
    setIsSending(false);

    if (res.simulated) {
      setDispatchStatus('Simulated Telegram broadcast sent to 24 Rangers & Gram Panchayat members.');
    } else if (res.success) {
      setDispatchStatus('✅ Successfully dispatched live Telegram alert via Bot API!');
    } else {
      setDispatchStatus(`⚠️ Telegram Webhook Error: ${res.error || 'Check Bot Token / Chat ID'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar */}
        <div
          className={`px-4 py-3 border-b flex items-center justify-between ${
            isCritical
              ? 'bg-red-950/40 border-red-500/30 text-red-200'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg ${
                isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <BellRing className="w-4 h-4 animate-bounce" />
            </span>
            <div>
              <span className="text-xs font-mono uppercase font-bold tracking-wider">
                Western Ghats Broadcast Emergency
              </span>
              <p className="text-[11px] text-slate-300">Bilingual Telegram & SMS Alert</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telegram App Simulated Screen Card */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="bg-[#17212b] rounded-xl border border-[#2b5278]/40 p-4 shadow-inner space-y-3">
            {/* Telegram Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-xs shadow-sm">
                  🌲
                </div>
                <div>
                  <span className="font-semibold text-slate-100 block">
                    Aranya-Drishti Alert Bot
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono">
                    @kfd_acoustic_sentinel_bot · 1.4k subscribers
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{currentAlert.timestamp}</span>
            </div>

            {/* Telegram Message Balloon */}
            <div className="bg-[#1e2c3a] p-3.5 rounded-lg border border-white/5 space-y-2.5 text-xs">
              {/* English Version */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-sky-300 tracking-wider">
                  [ENGLISH ADVISORY]
                </span>
                <p className="text-slate-100 font-medium leading-relaxed">
                  {currentAlert.englishMessage}
                </p>
              </div>

              {/* Kannada Version */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <span className="text-[10px] font-mono font-bold text-amber-300 tracking-wider">
                  [ಕನ್ನಡ ಪ್ರಕಟಣೆ / KANNADA BROADCAST]
                </span>
                <p className="text-emerald-300 font-kannada text-[13px] leading-relaxed">
                  {currentAlert.kannadaMessage}
                </p>
              </div>

              {/* Telegram Delivery Footer */}
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono border-t border-white/5">
                <span>📍 Sensor: {currentAlert.towerName}</span>
                <span className="flex items-center gap-1 text-sky-400">
                  <CheckCircle2 className="w-3 h-3" />
                  Sent to {currentAlert.recipientsCount} Beat Guards
                </span>
              </div>
            </div>
          </div>

          {/* Webhook Configuration Toggle */}
          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Live Telegram Webhook Gateway
              </span>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="text-emerald-400 hover:underline text-[11px]"
              >
                {showConfig ? 'Hide Config' : 'Configure Bot Token'}
              </button>
            </div>

            {showConfig && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                    Telegram Bot Token (from @BotFather)
                  </label>
                  <input
                    type="password"
                    placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                    Chat ID or Channel Username (e.g. -10012345678 or @my_channel)
                  </label>
                  <input
                    type="text"
                    placeholder="-100192837465"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-100 font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {dispatchStatus && (
              <div className="p-2 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono">
                {dispatchStatus}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            Dismiss Alert
          </button>

          <button
            onClick={handleTestRealTelegram}
            disabled={isSending}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Transmitting...' : 'Dispatch / Re-send Telegram Alert'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
