'use client'

import React, { useState } from 'react'
import { MessageSquare, X, Send, Bot, CheckCircle2, ArrowUpRight } from 'lucide-react'

interface WhatsAppWidgetProps {
  phoneNumber?: string
  defaultMessage?: string
}

export function WhatsAppWidget({
  phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919847012345',
  defaultMessage = 'Hello Packo.ofc Team! I would like to inquire about your products and services.',
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [userMessage, setUserMessage] = useState(defaultMessage)

  const quickQuestions = [
    '📦 I need help tracking my order',
    '🛍️ I have a product inquiry',
    '🚚 Shipping and delivery times',
    '💬 Connect with live support agent',
  ]

  const handleSendToWhatsApp = (messageToSend?: string) => {
    const text = messageToSend || userMessage || defaultMessage
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Interactive WhatsApp Chat Popover Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 rounded-3xl border border-emerald-500/20 bg-background shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white border border-white/30">
                  <Bot className="h-6 w-6" />
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">Packo.ofc WhatsApp Support</h3>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <p className="text-[11px] text-emerald-100/90 font-medium">Online • Instant WhatsApp Bot & Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20 transition-colors text-white/90 hover:text-white"
              aria-label="Close WhatsApp chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Content Body */}
          <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
            {/* Bot Greeting Bubble */}
            <div className="flex items-start gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-card border border-border p-3 shadow-sm text-xs text-foreground space-y-1.5">
                <p className="font-semibold text-emerald-600 dark:text-emerald-400">Packo Assistant Bot</p>
                <p className="leading-relaxed">
                  Hi there! 👋 Welcome to Packo.ofc. How can we help you today? Choose a quick inquiry below or type a message to launch WhatsApp!
                </p>
                <span className="text-[10px] text-muted-foreground block text-right">Just now</span>
              </div>
            </div>

            {/* Quick Inquiry Buttons */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-1">Quick Topics</p>
              <div className="flex flex-col gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUserMessage(q)
                      handleSendToWhatsApp(q)
                    }}
                    className="text-left text-xs bg-card hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl px-3 py-2 transition-all flex items-center justify-between group font-medium"
                  >
                    <span>{q}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-emerald-500" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Input Area */}
          <div className="p-3 border-t border-border bg-card space-y-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your WhatsApp message..."
                className="w-full rounded-2xl border border-input bg-background pl-3 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendToWhatsApp()
                }}
              />
              <button
                onClick={() => handleSendToWhatsApp()}
                className="absolute right-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 transition-all active:scale-95 shadow-md shadow-emerald-600/20"
                title="Open WhatsApp Chat"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-center text-muted-foreground font-medium">
              Clicking send opens WhatsApp application / WhatsApp Web directly.
            </p>
          </div>
        </div>
      )}

      {/* Main Floating WhatsApp Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white p-3.5 sm:px-4 sm:py-3 shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all duration-300 active:scale-95 border border-white/20"
        aria-label="Open WhatsApp Chat Support"
      >
        {/* Pulsing indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white dark:border-slate-900" />
        </span>

        {/* WhatsApp Icon */}
        <svg className="h-6 w-6 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          WhatsApp Support
        </span>
      </button>
    </div>
  )
}
