import { Desktop } from './components/desktop/Desktop'

function App(): React.JSX.Element {
  return (
    <Desktop
      onMinimize={() => window.api.minimizeWindow()}
      onMaximize={() => window.api.maximizeWindow()}
      onClose={() => window.api.closeWindow()}
    />
  )
}

export default App
