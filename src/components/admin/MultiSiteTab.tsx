import React, { useState } from 'react';
import { Film, Plus, Check, Copy, Download, Globe, Sparkles, ExternalLink, Code } from 'lucide-react';
import { MovieEventPreset, MovieSettings } from '../../types.ts';
import { dataService } from '../../services/dataService.ts';

interface MultiSiteTabProps {
  currentSettings: MovieSettings;
  onEventSwitched: (newSettings: MovieSettings) => void;
}

export const MultiSiteTab: React.FC<MultiSiteTabProps> = ({
  currentSettings,
  onEventSwitched
}) => {
  const [presets, setPresets] = useState<MovieEventPreset[]>(() => dataService.getPresets());
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    presets.find((p) => p.movie_title.toLowerCase() === currentSettings.movie_title.toLowerCase())?.id ||
      presets[0].id
  );

  // New movie event modal/form
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEventName, setNewEventName] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newTrailerUrl, setNewTrailerUrl] = useState('');
  const [newChallengeName, setNewChallengeName] = useState('UNO Challenge');

  const [copiedWorkflow, setCopiedWorkflow] = useState(false);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);

  const handleActivatePreset = async (presetId: string) => {
    try {
      const updated = await dataService.switchActivePreset(presetId);
      setSelectedPresetId(presetId);
      onEventSwitched(updated);
      setActiveMessage(`Active movie website switched to "${updated.movie_title}"!`);
      setTimeout(() => setActiveMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to switch event');
    }
  };

  const handleCreateNewPreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const id = newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
    const newPreset: MovieEventPreset = {
      id,
      movie_title: newTitle.trim(),
      event_name: newEventName.trim() || 'FAMILY MOVIE NIGHT PREMIERE',
      tagline: newTagline.trim() || 'Two UNO Games. One Epic Movie Night.',
      hero_image_url: '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg',
      event_date: newDate.trim() || 'Saturday, December 12, 2026',
      event_time: newTime.trim() || '7:00 PM',
      venue: newVenue.trim() || 'Main Family Screening Room',
      trailer_url: newTrailerUrl.trim() || 'https://www.youtube.com/embed/Y5BeWdODPqo',
      challenge_name: newChallengeName.trim() || 'UNO Challenge',
      challenge_game1_label: 'Game 1',
      challenge_game2_label: 'Game 2',
      authorised_gallery_image_urls: [
        '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg',
        '/src/assets/images/jailer_uno_arena_1793199450537.jpg'
      ]
    };

    const updatedPresets = await dataService.createOrSavePreset(newPreset);
    setPresets(updatedPresets);
    setIsCreatingNew(false);
    await handleActivatePreset(id);
  };

  const githubActionWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install --legacy-peer-deps

      - name: Build static website
        run: npm run build

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(githubActionWorkflow);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 3000);
  };

  const handleDownloadWorkflow = () => {
    const blob = new Blob([githubActionWorkflow], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deploy.yml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportConfigJson = () => {
    const exportData = {
      activeSettings: currentSettings,
      presets: presets,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSettings.movie_title.toLowerCase().replace(/\s+/g, '_')}_website_config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
          <Globe className="w-4 h-4" />
          <span>Multi-Website & GitHub Publisher</span>
        </div>
        <h2 className="font-cinematic text-2xl sm:text-3xl font-black text-white">
          USE ONE PROJECT FOR MULTIPLE MOVIE WEBSITES
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Switch between movie themes, create brand new screening websites, and deploy to GitHub Pages with 1-click.
        </p>
      </div>

      {activeMessage && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">{activeMessage}</span>
        </div>
      )}

      {/* SECTION 1: MOVIE PRESET SELECTOR & MANAGER */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="font-cinematic text-lg font-bold text-white">
              Movie Screening Presets
            </h3>
            <p className="text-xs text-neutral-400">
              Select which movie night is currently active on the public website.
            </p>
          </div>

          <button
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreatingNew ? 'Cancel New Movie' : 'Create New Movie Website'}</span>
          </button>
        </div>

        {/* Create New Movie Form */}
        {isCreatingNew && (
          <form onSubmit={handleCreateNewPreset} className="p-5 rounded-xl bg-neutral-900/90 border border-amber-600/50 space-y-4">
            <h4 className="font-cinematic text-sm font-bold text-amber-400 uppercase tracking-wider">
              Add New Movie Screening Configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Movie Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Leo, Avatar 3, Coolie, or Inception"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Event Subtitle</label>
                <input
                  type="text"
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g. THE ULTIMATE FAMILY PREMIERE"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Tagline</label>
                <input
                  type="text"
                  value={newTagline}
                  onChange={(e) => setNewTagline(e.target.value)}
                  placeholder="e.g. Two UNO Games. One Epic Movie Night."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Challenge Name</label>
                <input
                  type="text"
                  value={newChallengeName}
                  onChange={(e) => setNewChallengeName(e.target.value)}
                  placeholder="e.g. UNO Challenge, Movie Trivia, Mario Kart"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Date</label>
                <input
                  type="text"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  placeholder="e.g. Saturday, December 19, 2026"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Time & Venue</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. Family Cinema Lounge, Screen 1"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white"
                />
              </div>

              <div className="col-span-full">
                <label className="block text-neutral-300 font-semibold mb-1">Trailer YouTube Embed URL</label>
                <input
                  type="text"
                  value={newTrailerUrl}
                  onChange={(e) => setNewTrailerUrl(e.target.value)}
                  placeholder="https://www.youtube.com/embed/..."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase rounded transition-all cursor-pointer"
            >
              Save & Activate Movie Website
            </button>
          </form>
        )}

        {/* Existing Presets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {presets.map((p) => {
            const isActive =
              p.movie_title.toLowerCase() === currentSettings.movie_title.toLowerCase();

            return (
              <div
                key={p.id}
                className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-neutral-900 border-amber-500 shadow-xl shadow-amber-950/20'
                    : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                      ID: {p.id}
                    </span>
                    {isActive ? (
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-bold text-[10px] uppercase">
                        Active Website
                      </span>
                    ) : (
                      <span className="text-neutral-500 text-[11px]">Preset</span>
                    )}
                  </div>

                  <h4 className="font-cinematic text-xl font-black text-white mb-1">
                    {p.movie_title}
                  </h4>
                  <div className="text-xs text-amber-300 font-medium mb-3">
                    {p.event_name}
                  </div>
                  <p className="text-[11px] text-neutral-400 italic mb-4 line-clamp-2">
                    "{p.tagline}"
                  </p>

                  <div className="text-[11px] text-neutral-400 space-y-1 mb-4 font-mono">
                    <div>📅 {p.event_date}</div>
                    <div className="truncate">📍 {p.venue}</div>
                    <div>🎮 Challenge: {p.challenge_name || 'UNO Challenge'}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleActivatePreset(p.id)}
                  disabled={isActive}
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 cursor-default'
                      : 'bg-amber-400 hover:bg-amber-300 text-black'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Current Active Website</span>
                    </>
                  ) : (
                    <span>Switch to this Movie</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: GITHUB PAGES DEPLOYMENT GUIDE */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Code className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinematic text-lg font-bold text-white">
              Publishing to GitHub as a Website (GitHub Pages)
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            This application is designed to run 100% client-side on GitHub Pages without requiring a paid server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <span className="font-bold text-amber-400 block mb-1">Step 1: Push to GitHub</span>
            <p className="text-neutral-400 leading-relaxed">
              Create a new repository on your GitHub account (e.g. <code className="bg-black px-1 rounded text-neutral-300">jailer-movie-night</code>) and push this project's code.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <span className="font-bold text-amber-400 block mb-1">Step 2: Add GitHub Action</span>
            <p className="text-neutral-400 leading-relaxed">
              Place the workflow file at <code className="bg-black px-1 rounded text-neutral-300">.github/workflows/deploy.yml</code> using the 1-click button below.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800">
            <span className="font-bold text-amber-400 block mb-1">Step 3: Enable Pages</span>
            <p className="text-neutral-400 leading-relaxed">
              In your GitHub repo: <strong className="text-white">Settings → Pages → Source → GitHub Actions</strong>. Your site goes live instantly!
            </p>
          </div>
        </div>

        {/* Workflow actions */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-white">
              GitHub Actions Workflow (.github/workflows/deploy.yml)
            </div>
            <div className="text-[11px] text-neutral-400">
              Automates Vite static build and deploys to GitHub Pages on every git push.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWorkflow}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedWorkflow ? 'Copied YAML!' : 'Copy Workflow YAML'}</span>
            </button>

            <button
              onClick={handleDownloadWorkflow}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-black rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download deploy.yml</span>
            </button>
          </div>
        </div>

        {/* Export Configuration JSON */}
        <div className="pt-2 flex justify-between items-center text-xs text-neutral-400 border-t border-neutral-800">
          <span>Export current movie configuration to clone to another repo:</span>
          <button
            onClick={handleExportConfigJson}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Config JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
};
