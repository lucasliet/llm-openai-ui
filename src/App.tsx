import { Chat } from './components/chat/Chat'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>ChatGPT Clone</h1>
      </header>
      <main>
        <Chat />
      </main>
    </div>
  )
}

export default App
