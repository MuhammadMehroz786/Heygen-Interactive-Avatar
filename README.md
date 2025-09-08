# Interactive Avatar Playground

A Next.js starter for HeyGen Interactive Streaming Avatar service that demonstrates real-time avatar interaction with various features.

## Features

- **Real-time Avatar Streaming**: Connect to HeyGen's Interactive Avatar API
- **Voice Interaction**: Speech-to-text input and customizable voice settings
- **Background Effects**: Remove, blur, or replace backgrounds
- **Recording**: Capture screenshots and video recordings
- **Conversation History**: Track chat transcript
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Jotai
- **Avatar Service**: HeyGen Interactive/Streaming Avatar

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- HeyGen API key

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd interactive-avatar-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Add your HeyGen API key to `.env.local`:
   ```
   NEXT_PUBLIC_HEYGEN_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect**: Enter your HeyGen API key and select an avatar
2. **Interact**: Type messages or use voice input to talk with the avatar
3. **Customize**: Adjust voice settings, emotions, and speech rate
4. **Effects**: Apply background blur or replacement
5. **Record**: Take screenshots or record video sessions

## Configuration

### Avatar Settings
- Multiple avatar options available
- Customizable voice emotions (Friendly, Serious, Soothing, Excited, Broadcast)
- Adjustable speech rate (0.5x - 2.0x)

### Background Effects
- Original background (no processing)
- Blur effect
- Custom background replacement
- Adjustable processing quality

## API Integration

This project integrates with HeyGen's Interactive Streaming Avatar API. You'll need to:

1. Sign up for a HeyGen account
2. Get your API key from the dashboard
3. Add the key to your environment variables

## Deployment

Deploy easily on platforms like Vercel:

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.