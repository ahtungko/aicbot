import React, { useState } from 'react';
import { ChevronDown, Settings, Menu, X } from 'lucide-react';
import { Model, ConversationSettings } from '@aicbot/shared';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';

interface ModelSelectorProps {
  models: Model[] | undefined;
  selectedModel: string;
  settings: ConversationSettings;
  onModelChange: (modelId: string) => void;
  onSettingsChange: (settings: ConversationSettings) => void;
  loading?: boolean;
}

export function ModelSelector({
  models,
  selectedModel,
  settings,
  onModelChange,
  onSettingsChange,
  loading = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedModelData = models?.find(m => m.id === selectedModel);

  const handleTemperatureChange = (value: number) => {
    onSettingsChange({ ...settings, temperature: value });
  };

  const handleMaxTokensChange = (value: number) => {
    onSettingsChange({ ...settings, maxTokens: value });
  };

  if (loading) {
    return (
      <div className="border-b bg-white p-4">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-b bg-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile menu button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Model Settings
            </span>
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Desktop layout */}
        <div className={`lg:flex lg:items-center lg:gap-4 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          {/* Model selector */}
          <div className="relative mb-4 lg:mb-0">
            <Button
              variant="secondary"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full lg:w-auto justify-between min-w-[200px]"
            >
              <span className="truncate">
                {selectedModelData?.name || 'Select Model'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
            
            {isOpen && (
              <div className="absolute top-full left-0 mt-1 w-full lg:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                {models?.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`
                      w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                      ${selectedModel === model.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'}
                    `}
                  >
                    <div className="font-medium">{model.name}</div>
                    {model.description && (
                      <div className="text-sm text-gray-500 mt-1">{model.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Max tokens: {model.maxTokens.toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="mb-4 lg:mb-0"
          >
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </Button>

          {/* Settings panel */}
          {showSettings && (
            <div className="lg:flex lg:items-center lg:gap-6 bg-gray-50 rounded-lg p-4">
              {/* Temperature slider */}
              <div className="mb-4 lg:mb-0 lg:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature: {settings.temperature.toFixed(1)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max tokens slider */}
              <div className="lg:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Tokens: {settings.maxTokens.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="100"
                  max={selectedModelData?.maxTokens || 4000}
                  step="100"
                  value={settings.maxTokens}
                  onChange={(e) => handleMaxTokensChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>100</span>
                  <span>{(selectedModelData?.maxTokens || 4000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}