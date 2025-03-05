import { Chat } from './components/chat/Chat'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>LLM Chat</h1>
      </header>
      <main>
        <Chat />
      </main>
    </div>
  )
}

export default App
