import { Routes, Route } from 'react-router-dom'
import AppShell from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import ProjectCreate from '@/pages/ProjectCreate'
import WorldView from '@/pages/WorldView'
import StoryOutline from '@/pages/StoryOutline'
import Characters from '@/pages/Characters'
import Storyboard from '@/pages/Storyboard'
import AssetManager from '@/pages/AssetManager'
import PostProduction from '@/pages/PostProduction'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<ProjectCreate />} />
        <Route path="/project/:id" element={<WorldView />} />
        <Route path="/project/:id/story" element={<StoryOutline />} />
        <Route path="/project/:id/characters" element={<Characters />} />
        <Route path="/project/:id/storyboard" element={<Storyboard />} />
        <Route path="/project/:id/assets" element={<AssetManager />} />
        <Route path="/project/:id/post" element={<PostProduction />} />
      </Routes>
    </AppShell>
  )
}