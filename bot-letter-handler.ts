/**
 * Модуль Новогоднего Письма-Стикера для MAX Messenger Bot API
 * Совместим с вашим проектом бота в Downloads/max (или любым другим ботом МАКС).
 * 
 * Базовый URL: https://platform-api2.max.ru
 */

import { InlineKeyboardAttachment, NewMessageBody } from './max-types';

export const NY_LETTER_HANDLERS = {
  /**
   * 1. Сообщение с закрытым письмом и кнопкой «✉️ Открыть письмо»
   */
  getClosedLetterMessage(webAppUrl?: string): NewMessageBody {
    const buttons: any[][] = [
      [
        {
          type: 'callback',
          text: '✉️ Открыть письмо',
          payload: 'ny_letter_open',
        },
      ],
    ];

    // Если есть ссылка на интерактивное мини-приложение (GitHub Pages / WebApp)
    if (webAppUrl) {
      buttons.push([
        {
          type: 'link',
          text: '✨ Открыть 3D-письмо с анимацией',
          url: webAppUrl,
        },
      ]);
    }

    return {
      text: 
`📬 **Вам доставлено тайное новогоднее послание!** ❄️
Сургучная печать запечатана Дедом Морозом.

Нажмите на конверт ниже, чтобы открыть его:`,
      format: 'markdown',
      attachments: [
        {
          type: 'inline_keyboard',
          payload: { buttons },
        },
      ],
    };
  },

  /**
   * 2. Раскрытое письмо с вопросом: «Что ты хочешь на Новый год?» и кнопкой «Понял»
   */
  getOpenedLetterMessage(): NewMessageBody {
    return {
      text: 
`🎄✨ **Новогоднее послание Деда Мороза** ✨🎄
────────────────────────────
Дорогой друг!

Главный вопрос уходящего года:
🎁 **Что ты хочешь на Новый год?**

_Напиши своё желание прямо в этот чат или просто нажми кнопку ниже:_`,
      format: 'markdown',
      attachments: [
        {
          type: 'inline_keyboard',
          payload: {
            buttons: [
              [
                {
                  type: 'callback',
                  text: '👍 Понял',
                  payload: 'ny_letter_understood',
                },
              ],
            ],
          },
        },
      ],
    };
  },

  /**
   * 3. Ответ после нажатия на кнопку «Понял»
   */
  getUnderstoodMessage(userWish?: string): NewMessageBody {
    const wishLine = userWish ? `\n\n🌟 Твоё желание: _«${userWish}»_` : '';
    return {
      text: 
`🎅🎉 **Понял! Записано в Книгу новогодних чудес!** 📜✨${wishLine}

Дед Мороз и Снегурочка уже упаковывают подарки.
Пусть в Новом Году всё задуманное обязательно сбудется! ⛄❄️`,
      format: 'markdown',
      attachments: [],
    };
  },

  /**
   * Логика для callback.handler.ts:
   * Вызывается, когда приходит message_callback
   */
  handleCallback(callbackPayload: string, apiService: any, callbackId: string) {
    if (callbackPayload === 'ny_letter_open') {
      return apiService.answerCallback(callbackId, {
        notification: '✨ Письмо распечатано!',
        message: this.getOpenedLetterMessage(),
      });
    }

    if (callbackPayload === 'ny_letter_understood') {
      return apiService.answerCallback(callbackId, {
        notification: '🎅 Понял!',
        message: this.getUnderstoodMessage(),
      });
    }

    return null;
  },

  /**
   * Логика для message.handler.ts:
   * Вызывается, когда пользователь присылает сообщение в чат
   */
  handleTextMessage(text: string): { isHandled: boolean; response?: NewMessageBody } {
    const lower = text.toLowerCase().trim();

    // Запрос на открытие письма
    if (
      lower === 'письмо' || 
      lower === '/letter' || 
      lower.includes('новый год') || 
      lower.includes('стикер') || 
      lower.includes('пожелание')
    ) {
      return {
        isHandled: true,
        response: this.getClosedLetterMessage(),
      };
    }

    // Если человек ответил текстом «Понял» или написал своё желание
    if (lower === 'понял' || lower === 'поняла' || lower === 'понятно' || lower === 'готово') {
      return {
        isHandled: true,
        response: this.getUnderstoodMessage(),
      };
    }

    return { isHandled: false };
  },
};
