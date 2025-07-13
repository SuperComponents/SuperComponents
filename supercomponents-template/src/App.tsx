import { useState } from 'react'
import { Button } from '@/components/library/button'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Supercomponents Template
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">
              Tailwind CSS v4 + shadcn/ui Ready
            </h2>
            <p className="text-muted-foreground mb-4">
              This template is pre-configured with Tailwind CSS v4 and shadcn/ui components.
              The setup uses CSS-first configuration with the @theme directive.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setCount(count + 1)}>
                Count: {count}
              </Button>
              <Button variant="secondary">
                Secondary
              </Button>
              <Button variant="destructive">
                Destructive
              </Button>
              <Button variant="outline">
                Outline
              </Button>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">Features:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• React 19 with TypeScript</li>
              <li>• Vite 7.0 with HMR</li>
              <li>• Tailwind CSS v4 with CSS-first configuration</li>
              <li>• Storybook 9.0 for component development</li>
              <li>• shadcn/ui compatible components</li>
              <li>• Organized component structure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
