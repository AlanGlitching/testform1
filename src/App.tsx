import Clock from './components/Clock'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>World Clock</h1>
        <p>A React 18 + Vite application showing real-time clock with timezone selection</p>
      </header>
      <main className={styles.main}>
        <Clock />
      </main>
    </div>
  )
}

export default App 