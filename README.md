# HeyGen Interactive Avatar App

A modern Next.js application featuring HeyGen's Interactive Streaming Avatar with voice input, text messaging, and real-time avatar interaction.

## ✨ Features

- 🎭 **Multiple Avatars**: Choose from Anthony's different poses (Black Suit, White Suit, Chair Sitting)
- 🎤 **Continuous Voice Input**: Natural speech recognition for ongoing conversations
- 💬 **Text Messaging**: Send messages via text input or voice
- 🧠 **Knowledge Base Integration**: Enhanced responses powered by HeyGen's knowledge base
- 🎨 **Background Effects**: Custom backgrounds with real-time processing (disabled for sitting avatar)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔄 **Seamless Avatar Switching**: Automatic disconnect/reconnect when changing avatars
- 📸 **Media Controls**: Screenshot capture, fullscreen mode, and media controls

## 🛠 Technology Stack

- **Next.js 15.5.2** - React framework with App Router
- **HeyGen Streaming Avatar SDK v2.1.0** - Interactive avatar integration
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Jotai** - State management

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

## 🚀 Deployment

### Deploy on Netlify

1. **Connect Repository**: Link your GitHub repository to Netlify
2. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Environment Variables**: Add `HEYGEN_API_KEY=your_api_key_here`
4. **Deploy**: Click deploy!

### Deploy on Vercel

1. Connect your GitHub repository to Vercel
2. Add environment variable: `HEYGEN_API_KEY=your_api_key_here`
3. Deploy automatically

### Local Build

```bash
npm run build
npm start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.