export interface InlineKeyboardButton {
  type: 'callback' | 'link' | 'message' | 'request_contact' | 'request_geo_location' | 'open_app' | 'clipboard';
  text: string;
  payload?: string;
  url?: string;
  web_app?: string;
}

export interface InlineKeyboardAttachment {
  type: 'inline_keyboard';
  payload: {
    buttons: InlineKeyboardButton[][];
  };
}

export interface NewMessageBody {
  text?: string;
  attachments?: any[];
  format?: 'markdown' | 'html';
  notify?: boolean;
}
