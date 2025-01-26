# 👻 Spooky Stories

A modern web application for sharing and reading spine-chilling tales. Built with Next.js, Supabase, and TailwindCSS.

## ✨ Features

- 🌙 Dark theme optimized for spooky content
- 👤 User authentication with Supabase
- ✍️ Write and publish your horror stories
- 🎭 Profile customization
- 🔊 Atmospheric sound effects
- 🌫️ Spooky UI animations and effects
- 📱 Fully responsive design

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **Styling:** [TailwindCSS](https://tailwindcss.com/)
- **UI Components:**
  - [Radix UI](https://www.radix-ui.com/)
  - [Framer Motion](https://www.framer.com/motion/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Type Safety:** TypeScript

## 🚀 Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sillyBear14/Spooky-Stories.git
   cd Spooky-Stories
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

## 🧹 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clean` - Remove build artifacts

## 📁 Project Structure

```
src/
├── app/                 # App router pages
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── ui/             # Reusable UI components
│   └── providers/      # Context providers
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
└── config/             # App configuration
```

## 🎨 Features in Development

- [ ] Comments system
- [ ] Story ratings
- [ ] Categories and tags
- [ ] Social sharing
- [ ] Rich text editor
- [ ] Story collections

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/sillyBear14/Spooky-Stories/issues).

## 👥 Authors

- SillyBear14 - Initial work

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
