# World Clock - Timezone Selector

A modern React 18 + Vite application that displays the current time with real-time updates and timezone selection for cities around the world.

## 🚀 Features

- **Real-time Clock**: Displays current time with seconds precision
- **Timezone Selection**: Choose from 40+ cities and countries worldwide
- **Dynamic Time Display**: Time updates automatically based on selected timezone
- **Modern UI**: Beautiful gradient background with glassmorphism design
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **TypeScript**: Full type safety and better development experience
- **CSS Modules**: Scoped styling for better maintainability
- **Google Fonts**: Uses Inter font family for modern typography

## 🛠️ Tech Stack

- **React 18**: Latest React with concurrent features
- **Vite**: Fast build tool and development server
- **TypeScript**: Type-safe JavaScript
- **CSS Modules**: Scoped CSS styling
- **Google Fonts**: Inter font family

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd testform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Build

To build the project for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## 📁 Project Structure

```
testform/
├── public/
│   └── vite.svg          # Favicon
├── src/
│   ├── components/
│   │   ├── Clock.tsx     # Clock component
│   │   └── Clock.module.css
│   ├── App.tsx           # Main App component
│   ├── App.module.css    # App styles
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tsconfig.node.json    # Node TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🎨 Design Features

- **Glassmorphism Effect**: Semi-transparent clock container with backdrop blur
- **Gradient Background**: Beautiful purple-blue gradient
- **Typography**: Inter font family with various weights
- **Responsive**: Adapts to different screen sizes
- **Dark/Light Mode**: Automatically adapts to system preferences
- **Timezone Selector**: Beautiful dropdown with glassmorphism styling

## 🔧 Development

The application uses:
- **React Hooks**: `useState` and `useEffect` for state management
- **Timezone API**: Browser's Intl API for accurate timezone calculations
- **CSS Modules**: Scoped styling to prevent conflicts
- **TypeScript**: Full type safety for better development experience
- **Vite**: Fast hot module replacement and build process

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is open source and available under the [MIT License](LICENSE). 