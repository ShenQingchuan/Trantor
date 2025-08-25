import type { OSApp } from '../../bridge/types/auth'

export const MYOS_APPS: OSApp[] = [
  {
    id: 'chat',
    name: 'AI Chat',
    description: 'Chat with AI assistant',
    version: '1.0.0',
    category: 'productivity',
    permissions: [
      {
        id: 'chat.send',
        name: 'Send Messages',
        description: 'Send messages to AI assistant',
        level: 'write',
        required: true,
      },
      {
        id: 'chat.history',
        name: 'View History',
        description: 'View conversation history',
        level: 'read',
        required: true,
      },
      {
        id: 'chat.mcp',
        name: 'MCP Tools',
        description: 'Use Model Context Protocol tools',
        level: 'write',
        required: false,
      },
    ],
  },
  {
    id: 'music',
    name: 'Music',
    description: 'Music player application',
    version: '1.0.0',
    category: 'entertainment',
    permissions: [
      {
        id: 'music.list',
        name: 'List Music',
        description: 'List music',
        level: 'read',
        required: true,
      },
      {
        id: 'music.play',
        name: 'Play Music',
        description: 'Play music',
        level: 'read',
        required: true,
      },
    ],
  },
  {
    id: 'about',
    name: 'About',
    description: 'About MyOS',
    version: '1.0.0',
    category: 'system',
    permissions: [],
  },
]
